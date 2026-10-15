import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import Database from 'better-sqlite3';
import { EmprestimoController } from '../main/controllers/EmprestimoController.ts';
import { EmprestimoDAO } from '../main/daos/EmprestimoDAO.ts';
import { ProfessorDAO } from '../main/daos/ProfessorDAO.ts';
import { TurmaDAO } from '../main/daos/TurmaDAO.ts';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import type { ConsultarEmprestimoInput } from '../main/entities/ConsultaEmprestimo.ts';

describe('Consulta de itens de empréstimo - GET /emprestimos via IPC', () => {
  let db: Database.Database;
  let controller: EmprestimoController;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    db.exec(`
      CREATE TABLE professor (
        id INTEGER PRIMARY KEY, primeiro_nome TEXT NOT NULL, sobrenome TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('ATIVO', 'INATIVO'))
      );
      CREATE TABLE turma (
        id INTEGER PRIMARY KEY, nome TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('ATIVO', 'INATIVO'))
      );
      CREATE TABLE livro (
        id INTEGER PRIMARY KEY, titulo TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('ATIVO', 'INATIVO'))
      );
      CREATE TABLE emprestimo (
        id INTEGER PRIMARY KEY,
        professor_id INTEGER NOT NULL REFERENCES professor(id),
        turma_id INTEGER NOT NULL REFERENCES turma(id),
        data_retirada TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'CONCLUIDO', 'CANCELADO'))
      );
      CREATE TABLE item_emprestimo (
        id INTEGER PRIMARY KEY,
        emprestimo_id INTEGER NOT NULL REFERENCES emprestimo(id),
        livro_id INTEGER NOT NULL REFERENCES livro(id),
        quantidade_retirada INTEGER NOT NULL,
        quantidade_devolvida INTEGER NOT NULL DEFAULT 0,
        quantidade_perdida INTEGER NOT NULL DEFAULT 0,
        quantidade_danificada INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO professor VALUES (1, 'Ana', 'Silva', 'ATIVO'), (2, 'Maria', 'Souza', 'INATIVO');
      INSERT INTO turma VALUES (1, 'Maternal A', 'ATIVO'), (2, 'Maternal B', 'INATIVO');
      INSERT INTO livro VALUES (1, 'Livro A', 'ATIVO'), (2, 'Livro B', 'INATIVO'), (3, 'Livro C', 'ATIVO');
      INSERT INTO emprestimo VALUES
        (1, 1, 1, '2026-01-01T10:00:00.000Z', 'PENDENTE'),
        (2, 2, 2, '2026-02-01T10:00:00.000Z', 'CONCLUIDO'),
        (3, 1, 2, '2026-03-01T10:00:00.000Z', 'CANCELADO'),
        (4, 2, 1, '2026-03-01T10:00:00.000Z', 'PENDENTE');
      INSERT INTO item_emprestimo VALUES
        (1, 1, 1, 4, 1, 1, 1), (2, 1, 2, 2, 0, 0, 0),
        (3, 2, 2, 3, 3, 0, 0), (4, 3, 3, 1, 0, 0, 0),
        (5, 4, 1, 1, 0, 0, 0);
    `);
    controller = new EmprestimoController(
      new EmprestimoDAO(db), new LivroDAO(db), new ProfessorDAO(db), new TurmaDAO(db)
    );
  });

  afterEach(() => db.close());

  function ids(filtro?: ConsultarEmprestimoInput): number[] {
    return controller.consultar(filtro).map((item) => item.id).sort((a, b) => a - b);
  }

  it('lista todos os itens dos três status sem filtros ou com objeto vazio', () => {
    assert.deepEqual(ids(), [1, 2, 3, 4, 5]);
    assert.deepEqual(ids({}), [1, 2, 3, 4, 5]);
    assert.deepEqual(new Set(controller.consultar().map((item) => item.status)),
      new Set(['PENDENTE', 'CONCLUIDO', 'CANCELADO']));
  });

  const casos: Array<[string, ConsultarEmprestimoInput, number[]]> = [
    ['somente professor', { professorId: 1 }, [1, 2, 4]],
    ['somente turma', { turmaId: 1 }, [1, 2, 5]],
    ['somente livro, sem trazer os outros itens do mesmo empréstimo', { livroId: 1 }, [1, 5]],
    ['status pendente', { status: 'PENDENTE' }, [1, 2, 5]],
    ['status concluído', { status: 'CONCLUIDO' }, [3]],
    ['status cancelado', { status: 'CANCELADO' }, [4]],
    ['professor e turma', { professorId: 1, turmaId: 1 }, [1, 2]],
    ['professor e livro', { professorId: 1, livroId: 2 }, [2]],
    ['professor e status', { professorId: 1, status: 'CANCELADO' }, [4]],
    ['turma e livro', { turmaId: 1, livroId: 1 }, [1, 5]],
    ['turma e status', { turmaId: 2, status: 'CONCLUIDO' }, [3]],
    ['livro e status', { livroId: 2, status: 'PENDENTE' }, [2]],
    ['todos os filtros', { professorId: 2, turmaId: 2, livroId: 2, status: 'CONCLUIDO' }, [3]],
    ['filtros incompatíveis', { professorId: 1, turmaId: 1, status: 'CANCELADO' }, []],
    ['professor inexistente', { professorId: 999 }, []],
    ['turma inexistente', { turmaId: 999 }, []],
    ['livro inexistente', { livroId: 999 }, []],
    ['professor inativo', { professorId: 2 }, [3, 5]],
    ['turma inativa', { turmaId: 2 }, [3, 4]],
    ['livro inativo', { livroId: 2 }, [2, 3]],
  ];
  for (const [nome, filtro, esperado] of casos) {
    it(`filtra por ${nome}`, () => assert.deepEqual(ids(filtro), esperado));
  }

  it('retorna os dados de identificação e as quantidades de cada item sem duplicar linhas', () => {
    assert.deepEqual(controller.consultar({ livroId: 1, professorId: 1 }), [{
      id: 1, emprestimoId: 1, professorId: 1, professorNome: 'Ana Silva',
      turmaId: 1, turmaNome: 'Maternal A', livroId: 1, livroTitulo: 'Livro A',
      dataRetirada: new Date('2026-01-01T10:00:00.000Z'), status: 'PENDENTE',
      quantidadeRetirada: 4, quantidadeDevolvida: 1, quantidadePerdida: 1, quantidadeDanificada: 1,
    }]);
  });

  it('ordena pelos empréstimos mais recentes, desempatando por empréstimo e item', () => {
    assert.deepEqual(controller.consultar().map((item) => item.id), [5, 4, 3, 1, 2]);
  });

  it('retorna uma lista vazia quando não existem itens', () => {
    db.exec('DELETE FROM item_emprestimo; DELETE FROM emprestimo;');
    assert.deepEqual(controller.consultar(), []);
  });

  for (const campo of ['professorId', 'turmaId', 'livroId'] as const) {
    it(`rejeita ${campo} inválido em vez de ignorar o filtro`, () => {
      for (const valor of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1', null, true]) {
        assert.throws(() => controller.consultar({ [campo]: valor } as ConsultarEmprestimoInput),
          /ID de .* inválido/);
      }
    });
  }

  it('rejeita status inválido, incluindo tentativas de injeção SQL', () => {
    for (const status of ['', 'ATIVO', "PENDENTE' OR 1=1 --", null, 1]) {
      assert.throws(() => controller.consultar({ status } as ConsultarEmprestimoInput),
        /Status do empréstimo inválido/);
    }
  });

  it('rejeita filtros em formato inválido', () => {
    for (const input of [null, [], 'professor', 1]) {
      assert.throws(() => controller.consultar(input as ConsultarEmprestimoInput),
        /Filtros do empréstimo inválidos/);
    }
  });

  it('não modifica os dados ao consultar o histórico', () => {
    const antes = db.serialize();
    controller.consultar();
    controller.consultar({ professorId: 2, turmaId: 2, livroId: 2 });
    assert.deepEqual(db.serialize(), antes);
  });

  // Executa o módulo real, substituindo apenas a API do Electron indisponível no Node.
  function carregarModulo(caminho: string, electron: object) {
    const source = readFileSync(new URL(caminho, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    const exports: Record<string, any> = {};
    runInNewContext(outputText, {
      exports, console: { log() {} },
      require: (name: string) => {
        assert.equal(name, 'electron');
        return electron;
      },
    });
    return exports;
  }

  it('o handler IPC real retorna sucesso, lista vazia e erro de validação', async () => {
    const handlers = new Map<string, Function>();
    const modulo = carregarModulo('../main/ipc/emprestimoHandlers.ts', {
      ipcMain: { handle: (canal: string, handler: Function) => handlers.set(canal, handler) },
    });
    modulo.registerEmprestimoHandlers(controller);
    assert.ok(handlers.has('emprestimo:realizar'));
    const consultar = handlers.get('emprestimo:consultar')!;
    const todos = await consultar({});
    assert.equal(todos.success, true);
    assert.equal(todos.data.length, 5);
    const filtrado = await consultar({}, { professorId: 2, turmaId: 2, livroId: 2 });
    assert.equal(filtrado.success, true);
    assert.deepEqual(filtrado.data.map((item: { id: number }) => item.id), [3]);
    const vazio = await consultar({}, { livroId: 999 });
    assert.equal(vazio.success, true);
    assert.deepEqual(vazio.data, []);
    const invalido = await consultar({}, { status: 'INVALIDO' });
    assert.equal(invalido.success, false);
    assert.match(invalido.error, /Status do empréstimo inválido/);
  });

  for (const preload of ['../main/preload.ts', '../main/preload.cjs']) {
    it(`${preload} expõe a consulta e encaminha os filtros pelo IPC`, async () => {
      let api: any;
      const chamadas: unknown[][] = [];
      const resposta = { success: true, data: [] };
      carregarModulo(preload, {
        contextBridge: { exposeInMainWorld: (nome: string, valor: unknown) => {
          assert.equal(nome, 'ipc');
          api = valor;
        } },
        ipcRenderer: { invoke: async (...args: unknown[]) => {
          chamadas.push(args);
          return resposta;
        } },
      });
      const filtros = { professorId: 2, turmaId: 2, livroId: 2, status: 'CONCLUIDO' };
      assert.equal(await api.emprestimo.consultar(filtros), resposta);
      assert.equal(await api.emprestimo.consultar(), resposta);
      assert.deepEqual(chamadas, [
        ['emprestimo:consultar', filtros], ['emprestimo:consultar', undefined],
      ]);
    });
  }
});
