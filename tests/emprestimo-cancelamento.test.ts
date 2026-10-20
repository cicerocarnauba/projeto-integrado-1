import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import Database from 'better-sqlite3';
import { Emprestimo } from '../main/entities/Emprestimo.ts';
import { ItemEmprestimo } from '../main/entities/ItemEmprestimo.ts';
import { EmprestimoController } from '../main/controllers/EmprestimoController.ts';
import { EmprestimoDAO } from '../main/daos/EmprestimoDAO.ts';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import { ProfessorDAO } from '../main/daos/ProfessorDAO.ts';
import { TurmaDAO } from '../main/daos/TurmaDAO.ts';

describe('Regras da entidade - Cancelar empréstimo', () => {
  function criarEmprestimo() {
    return Emprestimo.criarNovo({
      professorId: 1, turmaId: 1,
      itens: [new ItemEmprestimo({ livroId: 1, quantidadeRetirada: 3 })],
    });
  }

  it('cancela um empréstimo pendente sem baixas e mantém os itens', () => {
    const emprestimo = criarEmprestimo();
    const itens = structuredClone(emprestimo.itens);
    emprestimo.cancelar();
    assert.equal(emprestimo.status, 'CANCELADO');
    assert.deepEqual(structuredClone(emprestimo.itens), itens);
    emprestimo.recalcularStatus();
    assert.equal(emprestimo.status, 'CANCELADO');
  });

  for (const status of ['CONCLUIDO', 'CANCELADO'] as const) {
    it(`impede cancelamento de empréstimo ${status}`, () => {
      const emprestimo = criarEmprestimo();
      emprestimo.status = status;
      assert.throws(() => emprestimo.cancelar(), /Apenas empréstimos com status "Pendente"/);
      assert.equal(emprestimo.status, status);
    });
  }

  for (const campo of ['quantidadeDevolvida', 'quantidadePerdida', 'quantidadeDanificada'] as const) {
    it(`impede cancelamento desde a primeira baixa em ${campo}`, () => {
      const emprestimo = criarEmprestimo();
      emprestimo.itens[0][campo] = 1;
      assert.throws(() => emprestimo.cancelar(), /devolução, perda ou avaria registrada/);
      assert.equal(emprestimo.status, 'PENDENTE');
    });
  }
});

describe('Cancelar empréstimo - PATCH /emprestimos/{id}/cancelar via IPC', () => {
  let db: Database.Database;
  let controller: EmprestimoController;
  let emprestimoDAO: EmprestimoDAO;
  let livroDAO: LivroDAO;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    db.exec(`
      CREATE TABLE professor (
        id INTEGER PRIMARY KEY, primeiro_nome TEXT NOT NULL, sobrenome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE, status TEXT NOT NULL,
        data_cadastro TEXT NOT NULL, data_atualizacao TEXT NOT NULL
      );
      CREATE TABLE turma (
        id INTEGER PRIMARY KEY, nome TEXT NOT NULL, status TEXT NOT NULL,
        data_cadastro TEXT NOT NULL, data_atualizacao TEXT NOT NULL
      );
      CREATE TABLE livro (
        id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, editora TEXT NOT NULL,
        quantidade_total INTEGER NOT NULL, quantidade_emprestada INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL, data_cadastro TEXT NOT NULL, data_atualizacao TEXT NOT NULL
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
      INSERT INTO professor VALUES
        (1, 'Maria', 'Silva', 'maria@escola.com', 'ATIVO', '2026-01-01', '2026-01-01');
      INSERT INTO turma VALUES (1, 'Maternal A', 'ATIVO', '2026-01-01', '2026-01-01');
      INSERT INTO livro VALUES
        (1, 'Livro A', 'Editora A', 10, 0, 'ATIVO', '2026-01-01', '2026-01-01'),
        (2, 'Livro B', 'Editora B', 8, 0, 'ATIVO', '2026-01-01', '2026-01-01');
    `);
    emprestimoDAO = new EmprestimoDAO(db);
    livroDAO = new LivroDAO(db);
    controller = new EmprestimoController(
      emprestimoDAO, livroDAO, new ProfessorDAO(db), new TurmaDAO(db)
    );
  });

  afterEach(() => db.close());

  function realizar(itens = [{ livroId: 1, quantidade: 3 }, { livroId: 2, quantidade: 2 }]) {
    return controller.realizar({ professorId: 1, turmaId: 1, itens });
  }

  function estado() {
    return {
      emprestimos: db.prepare('SELECT * FROM emprestimo ORDER BY id').all(),
      itens: db.prepare('SELECT * FROM item_emprestimo ORDER BY id').all(),
      livros: db.prepare('SELECT * FROM livro ORDER BY id').all(),
    };
  }

  it('repõe todo o saldo de vários livros e persiste CANCELADO preservando o histórico', () => {
    const emprestimo = realizar();
    assert.equal(livroDAO.buscarPorId(1)!.getSaldoDisponivel(), 7);
    assert.equal(livroDAO.buscarPorId(2)!.getSaldoDisponivel(), 6);

    const resultado = controller.cancelar(emprestimo.id!);
    assert.deepEqual(resultado, new Emprestimo({ ...emprestimo, status: 'CANCELADO' }));
    assert.deepEqual(emprestimoDAO.buscarPorId(emprestimo.id!), resultado);
    for (const [id, total] of [[1, 10], [2, 8]]) {
      const livro = livroDAO.buscarPorId(id)!;
      assert.equal(livro.quantidadeEmprestada, 0);
      assert.equal(livro.quantidadeTotal, total);
      assert.equal(livro.getSaldoDisponivel(), total);
      assert.equal(livro.status, 'ATIVO');
      assert.ok(livro.dataAtualizacao > new Date('2026-01-01'));
    }
    assert.equal(controller.consultar({ status: 'CANCELADO' }).length, 2);
    assert.equal(controller.consultar({ status: 'PENDENTE' }).length, 0);
  });

  it('repõe somente as quantidades deste empréstimo, incluindo itens repetidos do mesmo livro', () => {
    const outro = realizar([{ livroId: 1, quantidade: 2 }]);
    const emprestimo = realizar([
      { livroId: 1, quantidade: 1 }, { livroId: 2, quantidade: 2 },
      { livroId: 1, quantidade: 3 },
    ]);
    controller.cancelar(emprestimo.id!);
    assert.equal(livroDAO.buscarPorId(1)!.quantidadeEmprestada, 2);
    assert.equal(livroDAO.buscarPorId(1)!.getSaldoDisponivel(), 8);
    assert.equal(livroDAO.buscarPorId(2)!.quantidadeEmprestada, 0);
    assert.deepEqual(emprestimoDAO.buscarPorId(outro.id!), outro);
  });

  for (const status of ['CONCLUIDO', 'CANCELADO'] as const) {
    it(`rejeita status ${status} sem alterar saldo ou histórico`, () => {
      const emprestimo = realizar();
      db.prepare('UPDATE emprestimo SET status = ? WHERE id = ?').run(status, emprestimo.id);
      const antes = estado();
      assert.throws(() => controller.cancelar(emprestimo.id!), /Apenas empréstimos com status "Pendente"/);
      assert.deepEqual(estado(), antes);
    });
  }

  it('impede segunda chamada de cancelamento sem repor o saldo novamente', () => {
    const emprestimo = realizar();
    controller.cancelar(emprestimo.id!);
    const antes = estado();
    assert.throws(() => controller.cancelar(emprestimo.id!), /Apenas empréstimos com status "Pendente"/);
    assert.deepEqual(estado(), antes);
  });

  for (const campo of ['quantidade_devolvida', 'quantidade_perdida', 'quantidade_danificada']) {
    it(`bloqueia ${campo} parcial em qualquer item antes de repor saldo`, () => {
      const emprestimo = realizar();
      db.prepare(`UPDATE item_emprestimo SET ${campo} = 1 WHERE id = ?`)
        .run(emprestimo.itens[1].id);
      db.prepare('UPDATE livro SET quantidade_emprestada = quantidade_emprestada - 1 WHERE id = 2').run();
      const antes = estado();
      assert.throws(() => controller.cancelar(emprestimo.id!), /devolução, perda ou avaria registrada/);
      assert.deepEqual(estado(), antes);
    });
  }

  it('rejeita IDs inválidos e empréstimo inexistente sem efeitos colaterais', () => {
    realizar();
    const antes = estado();
    for (const id of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1', null, undefined, true]) {
      assert.throws(() => controller.cancelar(id as number), /ID do empréstimo inválido para cancelamento/);
    }
    assert.throws(() => controller.cancelar(999), /Empréstimo não encontrado/);
    assert.deepEqual(estado(), antes);
  });

  it('desfaz a reposição do primeiro livro quando o saldo do segundo está inconsistente', () => {
    const emprestimo = realizar();
    db.prepare('UPDATE livro SET quantidade_emprestada = 1 WHERE id = 2').run();
    const antes = estado();
    assert.throws(() => controller.cancelar(emprestimo.id!), /Não foi possível repor o saldo do livro \(ID 2\)/);
    assert.deepEqual(estado(), antes);
  });

  it('desfaz todas as reposições se a atualização do status falhar', () => {
    const emprestimo = realizar();
    db.exec(`
      CREATE TRIGGER simular_falha_cancelamento BEFORE UPDATE OF status ON emprestimo
      WHEN NEW.status = 'CANCELADO'
      BEGIN SELECT RAISE(ABORT, 'Falha simulada ao atualizar status'); END;
    `);
    const antes = estado();
    assert.throws(() => controller.cancelar(emprestimo.id!), /Falha simulada ao atualizar status/);
    assert.deepEqual(estado(), antes);
  });

  // Executa os módulos reais substituindo apenas a API do Electron, como na consulta.
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

  it('o handler IPC real retorna o empréstimo cancelado e mensagens de validação', async () => {
    const handlers = new Map<string, Function>();
    const modulo = carregarModulo('../main/ipc/emprestimoHandlers.ts', {
      ipcMain: { handle: (canal: string, handler: Function) => handlers.set(canal, handler) },
    });
    modulo.registerEmprestimoHandlers(controller);
    assert.ok(handlers.has('emprestimo:realizar'));
    assert.ok(handlers.has('emprestimo:consultar'));
    const cancelar = handlers.get('emprestimo:cancelar')!;
    const emprestimo = realizar();
    const resultado = await cancelar({}, emprestimo.id);
    assert.equal(resultado.success, true);
    assert.equal(resultado.data.status, 'CANCELADO');
    assert.deepEqual(resultado.data, emprestimoDAO.buscarPorId(emprestimo.id!));
    assert.equal(livroDAO.buscarPorId(1)!.getSaldoDisponivel(), 10);

    for (const [id, mensagem] of [
      [emprestimo.id, /Apenas empréstimos com status "Pendente"/],
      [0, /ID do empréstimo inválido/], [999, /Empréstimo não encontrado/],
    ] as const) {
      const erro = await cancelar({}, id);
      assert.equal(erro.success, false);
      assert.match(erro.error, mensagem);
      assert.equal(erro.data, undefined);
    }
    const parcial = realizar();
    db.prepare('UPDATE item_emprestimo SET quantidade_devolvida = 1 WHERE id = ?')
      .run(parcial.itens[0].id);
    const antes = estado();
    const erro = await cancelar({}, parcial.id);
    assert.equal(erro.success, false);
    assert.match(erro.error, /devolução, perda ou avaria registrada/);
    assert.deepEqual(estado(), antes);
  });

  for (const preload of ['../main/preload.ts', '../main/preload.cjs']) {
    it(`${preload} expõe cancelar(id) e encaminha a resposta pelo IPC`, async () => {
      let api: any;
      const chamadas: unknown[][] = [];
      const resposta = { success: true, data: { id: 1, status: 'CANCELADO' } };
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
      assert.equal(await api.emprestimo.cancelar(1), resposta);
      assert.deepEqual(chamadas, [['emprestimo:cancelar', 1]]);
    });
  }
});
