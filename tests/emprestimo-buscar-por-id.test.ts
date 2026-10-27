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

describe('Buscar Empréstimo por ID - GET /emprestimos/{id} via IPC', () => {
  let db: Database.Database;
  let controller: EmprestimoController;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    db.exec(`
      CREATE TABLE professor (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        primeiro_nome TEXT NOT NULL,
        sobrenome TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('ATIVO', 'INATIVO'))
      );

      CREATE TABLE turma (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('ATIVO', 'INATIVO'))
      );

      CREATE TABLE livro (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        editora TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('ATIVO', 'INATIVO'))
      );

      CREATE TABLE emprestimo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professor_id INTEGER NOT NULL REFERENCES professor(id),
        turma_id INTEGER NOT NULL REFERENCES turma(id),
        data_retirada TEXT NOT NULL,
        data_devolucao TEXT,
        status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'CONCLUIDO', 'CANCELADO'))
      );

      CREATE TABLE item_emprestimo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emprestimo_id INTEGER NOT NULL REFERENCES emprestimo(id),
        livro_id INTEGER NOT NULL REFERENCES livro(id),
        quantidade_retirada INTEGER NOT NULL,
        quantidade_devolvida INTEGER NOT NULL DEFAULT 0,
        quantidade_perdida INTEGER NOT NULL DEFAULT 0,
        quantidade_danificada INTEGER NOT NULL DEFAULT 0
      );

      INSERT INTO professor (id, primeiro_nome, sobrenome, status) VALUES
        (1, 'Carlos', 'Eduardo', 'ATIVO'),
        (2, 'Mariana', 'Costa', 'INATIVO');

      INSERT INTO turma (id, nome, status) VALUES
        (1, 'Berçário 1', 'ATIVO'),
        (2, 'Maternal 2', 'INATIVO');

      INSERT INTO livro (id, titulo, editora, status) VALUES
        (1, 'O Menino Maluquinho', 'Melhoramentos', 'ATIVO'),
        (2, 'Reinações de Narizinho', 'Globo Livros', 'ATIVO'),
        (3, 'Chapeuzinho Vermelho', 'Ática', 'INATIVO');

      -- Empréstimo 1: Pendente com 2 itens e 5 exemplares no total
      INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status) VALUES
        (1, 1, 1, '2026-10-15T09:00:00.000Z', NULL, 'PENDENTE');

      INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada) VALUES
        (1, 1, 1, 3, 0, 0, 0),
        (2, 1, 2, 2, 0, 0, 0);

      -- Empréstimo 2: Concluído com data de devolução e cadastros inativos
      INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status) VALUES
        (2, 2, 2, '2026-10-01T14:30:00.000Z', '2026-10-10T11:00:00.000Z', 'CONCLUIDO');

      INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada) VALUES
        (3, 2, 3, 4, 4, 0, 0);
    `);

    controller = new EmprestimoController(
      new EmprestimoDAO(db),
      new LivroDAO(db),
      new ProfessorDAO(db),
      new TurmaDAO(db)
    );
  });

  afterEach(() => db.close());

  it('deve buscar empréstimo por ID e retornar dados gerais e agrupamento de itens detalhados', () => {
    const res = controller.buscarPorId(1);

    assert.equal(res.id, 1);
    assert.equal(res.professorId, 1);
    assert.equal(res.professorNome, 'Carlos Eduardo');
    assert.equal(res.turmaId, 1);
    assert.equal(res.turmaNome, 'Berçário 1');
    assert.equal(res.status, 'PENDENTE');
    assert.equal(res.dataRetirada.toISOString(), '2026-10-15T09:00:00.000Z');
    assert.equal(res.dataDevolucao, null);
    assert.equal(res.quantidadeExemplares, 5); // 3 + 2

    assert.equal(res.itens.length, 2);

    const item1 = res.itens[0];
    assert.equal(item1.id, 1);
    assert.equal(item1.livroId, 1);
    assert.equal(item1.livroTitulo, 'O Menino Maluquinho');
    assert.equal(item1.titulo, 'O Menino Maluquinho');
    assert.equal(item1.editora, 'Melhoramentos');
    assert.equal(item1.quantidadeExemplar, 3);
    assert.equal(item1.quantidadeEmprestada, 3);
    assert.equal(item1.quantidadeRetirada, 3);
    assert.equal(item1.quantidadeDevolvida, 0);
    assert.equal(item1.status, 'PENDENTE');

    const item2 = res.itens[1];
    assert.equal(item2.id, 2);
    assert.equal(item2.livroId, 2);
    assert.equal(item2.livroTitulo, 'Reinações de Narizinho');
    assert.equal(item2.titulo, 'Reinações de Narizinho');
    assert.equal(item2.editora, 'Globo Livros');
    assert.equal(item2.quantidadeExemplar, 2);
    assert.equal(item2.quantidadeEmprestada, 2);
    assert.equal(item2.quantidadeRetirada, 2);
    assert.equal(item2.status, 'PENDENTE');
  });

  it('deve retornar a data de devolução quando estiver preenchida', () => {
    const res = controller.buscarPorId(2);

    assert.equal(res.id, 2);
    assert.equal(res.status, 'CONCLUIDO');
    assert.ok(res.dataDevolucao instanceof Date);
    assert.equal(res.dataDevolucao.toISOString(), '2026-10-10T11:00:00.000Z');
    assert.equal(res.quantidadeExemplares, 4);

    const item = res.itens[0];
    assert.equal(item.status, 'CONCLUIDO');
    assert.equal(item.quantidadeDevolvida, 4);
  });

  it('deve preservar o histórico mesmo se professor, turma ou livro estiverem inativos', () => {
    const res = controller.buscarPorId(2);

    assert.equal(res.professorNome, 'Mariana Costa');
    assert.equal(res.turmaNome, 'Maternal 2');
    assert.equal(res.itens[0].titulo, 'Chapeuzinho Vermelho');
    assert.equal(res.itens[0].editora, 'Ática');
  });

  it('deve lançar erro quando o empréstimo não for encontrado', () => {
    assert.throws(() => controller.buscarPorId(999), {
      message: 'Empréstimo não encontrado.',
    });
  });

  it('deve rejeitar IDs inválidos com mensagem clara', () => {
    for (const idInvalido of [0, -1, -100, 1.5, NaN, Infinity, -Infinity, null as any, undefined as any]) {
      assert.throws(() => controller.buscarPorId(idInvalido), {
        message: 'ID do empréstimo inválido para consulta.',
      });
    }
  });

  // Testes de integração do canal IPC e do preload
  function carregarModulo(caminho: string, electron: object) {
    const source = readFileSync(new URL(caminho, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    const exports: Record<string, any> = {};
    runInNewContext(outputText, {
      exports,
      console: { log() {} },
      require: (name: string) => {
        assert.equal(name, 'electron');
        return electron;
      },
    });
    return exports;
  }

  it('o handler IPC emprestimo:buscarPorId deve responder { success: true, data } ou erro amigável', async () => {
    const handlers = new Map<string, Function>();
    const modulo = carregarModulo('../main/ipc/emprestimoHandlers.ts', {
      ipcMain: { handle: (canal: string, handler: Function) => handlers.set(canal, handler) },
    });
    modulo.registerEmprestimoHandlers(controller);

    assert.ok(handlers.has('emprestimo:buscarPorId'));
    const buscarHandler = handlers.get('emprestimo:buscarPorId')!;

    // Sucesso
    const resSucesso = await buscarHandler({}, 1);
    assert.equal(resSucesso.success, true);
    assert.equal(resSucesso.data.id, 1);
    assert.equal(resSucesso.data.professorNome, 'Carlos Eduardo');
    assert.equal(resSucesso.data.itens.length, 2);

    // ID não encontrado
    const resNaoEncontrado = await buscarHandler({}, 999);
    assert.equal(resNaoEncontrado.success, false);
    assert.equal(resNaoEncontrado.error, 'Empréstimo não encontrado.');

    // ID inválido
    const resInvalido = await buscarHandler({}, 0);
    assert.equal(resInvalido.success, false);
    assert.equal(resInvalido.error, 'ID do empréstimo inválido para consulta.');
  });

  for (const preload of ['../main/preload.ts', '../main/preload.cjs']) {
    it(`${preload} deve expor buscarPorId e invocar emprestimo:buscarPorId`, async () => {
      let api: any;
      const chamadas: unknown[][] = [];
      const respostaEsperada = { success: true, data: { id: 1 } };

      carregarModulo(preload, {
        contextBridge: {
          exposeInMainWorld: (nome: string, valor: unknown) => {
            assert.equal(nome, 'ipc');
            api = valor;
          },
        },
        ipcRenderer: {
          invoke: async (...args: unknown[]) => {
            chamadas.push(args);
            return respostaEsperada;
          },
        },
      });

      assert.equal(typeof api.emprestimo.buscarPorId, 'function');
      const resultado = await api.emprestimo.buscarPorId(42);
      assert.equal(resultado, respostaEsperada);
      assert.deepEqual(chamadas, [['emprestimo:buscarPorId', 42]]);
    });
  }
});
