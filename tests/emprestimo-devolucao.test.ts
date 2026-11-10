import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import Database from 'better-sqlite3';
import { ItemEmprestimo } from '../main/entities/ItemEmprestimo.ts';
import { EmprestimoController } from '../main/controllers/EmprestimoController.ts';
import { EmprestimoDAO } from '../main/daos/EmprestimoDAO.ts';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import { ProfessorDAO } from '../main/daos/ProfessorDAO.ts';
import { TurmaDAO } from '../main/daos/TurmaDAO.ts';

describe('Regras da entidade - Devolução no ItemEmprestimo', () => {
  it('calcula corretamente a quantidade pendente e o status de conclusão', () => {
    const item = new ItemEmprestimo({
      livroId: 1,
      quantidadeRetirada: 5,
    });

    assert.equal(item.getQuantidadePendente(), 5);
    assert.equal(item.isTotalmenteBaixado(), false);

    // Devolução parcial de 2
    item.devolver(2);
    assert.equal(item.quantidadeDevolvida, 2);
    assert.equal(item.getQuantidadePendente(), 3);
    assert.equal(item.isTotalmenteBaixado(), false);

    // Devolução total do restante (3)
    item.devolver(3);
    assert.equal(item.quantidadeDevolvida, 5);
    assert.equal(item.getQuantidadePendente(), 0);
    assert.equal(item.isTotalmenteBaixado(), true);
  });

  it('considera perdas e avarias no cálculo da quantidade pendente', () => {
    const item = new ItemEmprestimo({
      livroId: 1,
      quantidadeRetirada: 6,
      quantidadeDevolvida: 1,
      quantidadePerdida: 2,
      quantidadeDanificada: 1,
    });

    // 6 - 1 (devolvido) - 2 (perdido) - 1 (danificado) = 2 pendentes
    assert.equal(item.getQuantidadePendente(), 2);
    assert.equal(item.isTotalmenteBaixado(), false);

    // Devolver os 2 pendentes conclui o item
    item.devolver(2);
    assert.equal(item.getQuantidadePendente(), 0);
    assert.equal(item.isTotalmenteBaixado(), true);
  });

  it('rejeita quantidade maior que a pendente', () => {
    const item = new ItemEmprestimo({
      livroId: 1,
      quantidadeRetirada: 3,
      quantidadeDevolvida: 1,
    });

    // Pendente = 2; tentar devolver 3 deve falhar
    assert.throws(
      () => item.devolver(3),
      /A quantidade devolvida \(3\) não pode ser maior que a quantidade pendente \(2\)\./
    );
    assert.equal(item.quantidadeDevolvida, 1);
  });

  for (const valorInvalido of [0, -1, -5, 1.5, NaN, Infinity, -Infinity]) {
    it(`rejeita quantidade inválida (${valorInvalido})`, () => {
      const item = new ItemEmprestimo({
        livroId: 1,
        quantidadeRetirada: 3,
      });

      assert.throws(
        () => item.devolver(valorInvalido as number),
        /A quantidade devolvida deve ser um número inteiro maior que zero\./
      );
      assert.equal(item.quantidadeDevolvida, 0);
    });
  }
});

describe('Devolução de item de empréstimo - Banco de Dados e Controller', () => {
  let db: Database.Database;
  let controller: EmprestimoController;
  let emprestimoDAO: EmprestimoDAO;
  let livroDAO: LivroDAO;
  let professorDAO: ProfessorDAO;
  let turmaDAO: TurmaDAO;

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
        data_devolucao TEXT,
        status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'CONCLUIDO', 'CANCELADO'))
      );
      CREATE TABLE item_emprestimo (
        id INTEGER PRIMARY KEY,
        emprestimo_id INTEGER NOT NULL REFERENCES emprestimo(id),
        livro_id INTEGER NOT NULL REFERENCES livro(id),
        quantidade_retirada INTEGER NOT NULL,
        quantidade_devolvida INTEGER NOT NULL DEFAULT 0,
        quantidade_perdida INTEGER NOT NULL DEFAULT 0,
        quantidadeDanificada INTEGER NOT NULL DEFAULT 0,
        quantidade_danificada INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Inserção de dados iniciais
    const dataAtual = new Date().toISOString();
    db.prepare(`
      INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (1, 'Maria', 'Silva', 'maria@escola.com', 'ATIVO', ?, ?)
    `).run(dataAtual, dataAtual);

    db.prepare(`
      INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (1, '1º Ano A', 'ATIVO', ?, ?)
    `).run(dataAtual, dataAtual);

    db.prepare(`
      INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES
        (1, 'Dom Casmurro', 'Editora A', 10, 4, 'ATIVO', ?, ?),
        (2, 'O Cortiço', 'Editora B', 5, 2, 'ATIVO', ?, ?)
    `).run(dataAtual, dataAtual, dataAtual, dataAtual);

    // Empréstimo 1: Pendente com 2 itens
    db.prepare(`
      INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (1, 1, 1, ?, NULL, 'PENDENTE')
    `).run(dataAtual);

    db.prepare(`
      INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES
        (1, 1, 1, 4, 0, 0, 0),
        (2, 1, 2, 2, 0, 0, 0)
    `).run();

    emprestimoDAO = new EmprestimoDAO(db);
    livroDAO = new LivroDAO(db);
    professorDAO = new ProfessorDAO(db);
    turmaDAO = new TurmaDAO(db);
    controller = new EmprestimoController(emprestimoDAO, livroDAO, professorDAO, turmaDAO);
  });

  afterEach(() => {
    db.close();
  });

  it('encerra o item e repõe seu saldo, mantendo o empréstimo pendente enquanto houver outro item', () => {
    // Livro 1 tem total = 10, emprestada = 4 => saldo disponível = 6
    assert.equal(livroDAO.buscarPorId(1)!.getSaldoDisponivel(), 6);

    const resultado = controller.devolverItem(1, 1, { quantidadeDevolvida: 4 });

    assert.equal(resultado.id, 1);
    assert.equal(resultado.emprestimoId, 1);
    assert.equal(resultado.livroId, 1);
    assert.equal(resultado.quantidadeRetirada, 4);
    assert.equal(resultado.quantidadeDevolvida, 4);
    assert.equal(resultado.quantidadePendente, 0);
    assert.equal(resultado.status, 'CONCLUIDO');

    // Saldo disponível do livro deve aumentar exatamente 4 (de 6 para 10)
    const livroAtualizado = livroDAO.buscarPorId(1)!;
    assert.equal(livroAtualizado.quantidadeEmprestada, 0);
    assert.equal(livroAtualizado.getSaldoDisponivel(), 10);

    const emprestimo = emprestimoDAO.buscarPorId(1)!;
    assert.equal(emprestimo.status, 'PENDENTE');
    assert.equal(emprestimo.getTotalPendente(), 2);
  });

  it('conclui o empréstimo na última devolução, considerando perdas e avarias já registradas', () => {
    db.prepare(`
      UPDATE item_emprestimo SET quantidade_perdida = 1, quantidade_danificada = 1 WHERE id = 1
    `).run();
    db.prepare('UPDATE livro SET quantidade_total = 8, quantidade_emprestada = 2 WHERE id = 1').run();

    controller.devolverItem(1, 1, 2);
    controller.devolverItem(1, 2, 1);
    assert.equal(controller.buscarPorId(1).status, 'PENDENTE');
    assert.equal(emprestimoDAO.buscarPorId(1)!.getTotalPendente(), 1);

    const ultimoItem = controller.devolverItem(1, 2, 1);

    assert.equal(ultimoItem.status, 'CONCLUIDO');
    assert.equal(ultimoItem.quantidadePendente, 0);
    assert.equal(controller.buscarPorId(1).status, 'CONCLUIDO');
    assert.equal(emprestimoDAO.buscarPorId(1)!.getTotalPendente(), 0);
    assert.equal(livroDAO.buscarPorId(1)!.getSaldoDisponivel(), 8);
    assert.equal(livroDAO.buscarPorId(2)!.getSaldoDisponivel(), 5);
  });

  for (const status of ['CONCLUIDO', 'CANCELADO'] as const) {
    it(`bloqueia devolução em empréstimo ${status} sem alterar o banco`, () => {
      // O bloqueio deve ocorrer mesmo quando o histórico ainda tem saldo pendente no item.
      db.prepare('UPDATE emprestimo SET status = ? WHERE id = 1').run(status);
      const antes = db.serialize();

      assert.throws(
        () => controller.devolverItem(1, 1, 1),
        /Apenas empréstimos com status "Pendente" podem receber devoluções\./
      );
      assert.deepEqual(db.serialize(), antes);
    });
  }

  it('bloqueia cancelamento após a primeira devolução parcial registrada (RN08)', () => {
    controller.devolverItem(1, 1, 1);
    assert.equal(controller.buscarPorId(1).status, 'PENDENTE');
    const antes = db.serialize();

    assert.throws(
      () => controller.cancelar(1),
      /Não é possível cancelar um empréstimo com devolução, perda ou avaria registrada\./
    );
    assert.deepEqual(db.serialize(), antes);
  });

  it('permite cancelar um empréstimo pendente sem baixas e repõe todo o estoque (HU20)', () => {
    assert.equal(controller.cancelar(1).status, 'CANCELADO');
    assert.equal(controller.buscarPorId(1).status, 'CANCELADO');
    assert.equal(livroDAO.buscarPorId(1)!.getSaldoDisponivel(), 10);
    assert.equal(livroDAO.buscarPorId(2)!.getSaldoDisponivel(), 5);
  });

  it('Dado um item Pendente, devolução parcial aumenta o saldo proporcionalmente e o restante continua pendente', () => {
    // Livro 1 tem total = 10, emprestada = 4 => saldo disponível = 6
    assert.equal(livroDAO.buscarPorId(1)!.getSaldoDisponivel(), 6);

    // Devolve 2 de 4
    const resultado = controller.devolverItem(1, 1, { quantidadeDevolvida: 2 });

    assert.equal(resultado.quantidadeDevolvida, 2);
    assert.equal(resultado.quantidadePendente, 2);
    assert.equal(resultado.status, 'PENDENTE');

    // Saldo disponível do livro aumenta em 2 (de 6 para 8)
    const livroAposPrimeiraDevolucao = livroDAO.buscarPorId(1)!;
    assert.equal(livroAposPrimeiraDevolucao.quantidadeEmprestada, 2);
    assert.equal(livroAposPrimeiraDevolucao.getSaldoDisponivel(), 8);

    // Faz mais uma devolução parcial de 1 exemplar (passando número direto como parâmetro)
    const resultado2 = controller.devolverItem(1, 1, 1);
    assert.equal(resultado2.quantidadeDevolvida, 3);
    assert.equal(resultado2.quantidadePendente, 1);
    assert.equal(resultado2.status, 'PENDENTE');

    // Saldo aumenta mais 1 (de 8 para 9)
    const livroAposSegundaDevolucao = livroDAO.buscarPorId(1)!;
    assert.equal(livroAposSegundaDevolucao.quantidadeEmprestada, 1);
    assert.equal(livroAposSegundaDevolucao.getSaldoDisponivel(), 9);
  });

  it('Dado uma quantidade maior que a pendente, quando confirma, então o sistema rejeita a operação', () => {
    // Item 1 tem 4 retirados e 0 devolvidos (pendente: 4). Tentar devolver 5:
    assert.throws(
      () => controller.devolverItem(1, 1, { quantidadeDevolvida: 5 }),
      /A quantidade devolvida \(5\) não pode ser maior que a quantidade pendente \(4\)\./
    );

    // Verifica que nada mudou no banco
    const itemNoBanco = emprestimoDAO.buscarItemPorId(1)!;
    assert.equal(itemNoBanco.quantidadeDevolvida, 0);

    const livro = livroDAO.buscarPorId(1)!;
    assert.equal(livro.quantidadeEmprestada, 4);
    assert.equal(livro.getSaldoDisponivel(), 6);
  });

  it('rejeita devolução em item que já teve todas as baixas realizadas', () => {
    controller.devolverItem(1, 1, 4);

    assert.throws(
      () => controller.devolverItem(1, 1, 1),
      /Este item já foi totalmente devolvido ou baixado\./
    );
  });

  for (const valorInvalido of [0, -1, -10, 2.5, NaN, '3' as any, null as any, undefined as any]) {
    it(`rejeita devolução com quantidade inválida (${valorInvalido})`, () => {
      assert.throws(
        () => controller.devolverItem(1, 1, { quantidadeDevolvida: valorInvalido }),
        /A quantidade devolvida deve ser um número inteiro maior que zero\./
      );

      // Garante que o saldo do livro e o item não foram alterados
      assert.equal(livroDAO.buscarPorId(1)!.getSaldoDisponivel(), 6);
      assert.equal(emprestimoDAO.buscarItemPorId(1)!.quantidadeDevolvida, 0);
    });
  }

  it('rejeita identificadores inválidos ou inexistentes de empréstimo e item', () => {
    assert.throws(
      () => controller.devolverItem(0, 1, 1),
      /ID do empréstimo inválido para devolução\./
    );
    assert.throws(
      () => controller.devolverItem(-2, 1, 1),
      /ID do empréstimo inválido para devolução\./
    );
    assert.throws(
      () => controller.devolverItem(1, 0, 1),
      /ID do item de empréstimo inválido para devolução\./
    );
    assert.throws(
      () => controller.devolverItem(1, -5, 1),
      /ID do item de empréstimo inválido para devolução\./
    );
    assert.throws(
      () => controller.devolverItem(999, 1, 1),
      /Empréstimo não encontrado\./
    );
    assert.throws(
      () => controller.devolverItem(1, 999, 1),
      /Item de empréstimo não encontrado\./
    );
  });

  it('rejeita devolução quando o item pertence a outro empréstimo', () => {
    // Cria Empréstimo 2 com Item 3
    const dataAtual = new Date().toISOString();
    db.prepare(`
      INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (2, 1, 1, ?, NULL, 'PENDENTE')
    `).run(dataAtual);

    db.prepare(`
      INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (3, 2, 1, 1, 0, 0, 0)
    `).run();

    // Tenta devolver item 3 associando ao empréstimo 1 (incompatível)
    assert.throws(
      () => controller.devolverItem(1, 3, 1),
      /Item de empréstimo não encontrado\./
    );
  });

  it('calcula e expõe quantidadePendente na consulta por detalhes (buscarPorId)', () => {
    // Antes da devolução
    const detalhesAntes = controller.buscarPorId(1);
    const item1Antes = detalhesAntes.itens.find((i) => i.id === 1)!;
    assert.equal(item1Antes.quantidadeRetirada, 4);
    assert.equal(item1Antes.quantidadeDevolvida, 0);
    assert.equal(item1Antes.quantidadePendente, 4);
    assert.equal(item1Antes.status, 'PENDENTE');

    // Registra devolução parcial de 3
    controller.devolverItem(1, 1, 3);

    // Após a devolução parcial
    const detalhesDepois = controller.buscarPorId(1);
    const item1Depois = detalhesDepois.itens.find((i) => i.id === 1)!;
    assert.equal(item1Depois.quantidadeRetirada, 4);
    assert.equal(item1Depois.quantidadeDevolvida, 3);
    assert.equal(item1Depois.quantidadePendente, 1);
    assert.equal(item1Depois.status, 'PENDENTE');

    // Registra a devolução do restante (1)
    controller.devolverItem(1, 1, 1);
    const detalhesConcluido = controller.buscarPorId(1);
    const item1Concluido = detalhesConcluido.itens.find((i) => i.id === 1)!;
    assert.equal(item1Concluido.quantidadeRetirada, 4);
    assert.equal(item1Concluido.quantidadeDevolvida, 4);
    assert.equal(item1Concluido.quantidadePendente, 0);
    assert.equal(item1Concluido.status, 'CONCLUIDO');
  });

  it('desfaz transação atomicamente se a reposição do saldo do livro falhar', () => {
    // Cria um trigger para simular erro inesperado ao atualizar a tabela livro
    db.exec(`
      CREATE TRIGGER simular_erro_livro BEFORE UPDATE OF quantidade_emprestada ON livro
      BEGIN SELECT RAISE(ABORT, 'Falha simulada na atualização do livro'); END;
    `);

    assert.throws(
      () => controller.devolverItem(1, 1, 2),
      /Falha simulada na atualização do livro/
    );

    // Confirma que a devolução no item foi desfeita pelo rollback do SQLite
    const itemNoBanco = emprestimoDAO.buscarItemPorId(1)!;
    assert.equal(itemNoBanco.quantidadeDevolvida, 0);
  });

  it('desfaz a última baixa e a reposição do estoque se a conclusão falhar', () => {
    controller.devolverItem(1, 1, 4);
    db.exec(`
      CREATE TRIGGER simular_erro_conclusao BEFORE UPDATE OF status ON emprestimo
      WHEN NEW.status = 'CONCLUIDO'
      BEGIN SELECT RAISE(ABORT, 'Falha simulada na conclusão'); END;
    `);
    const antes = db.serialize();

    assert.throws(() => controller.devolverItem(1, 2, 2), /Falha simulada na conclusão/);
    assert.deepEqual(db.serialize(), antes);
  });
});

describe('Devolução de item de empréstimo - Endpoint IPC e Preload', () => {
  let db: Database.Database;
  let controller: EmprestimoController;

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
        data_devolucao TEXT,
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
    `);

    const dataAtual = new Date().toISOString();
    db.prepare(`
      INSERT INTO professor VALUES (1, 'Prof', 'A', 'prof@a.com', 'ATIVO', ?, ?)
    `).run(dataAtual, dataAtual);
    db.prepare(`
      INSERT INTO turma VALUES (1, 'Turma A', 'ATIVO', ?, ?)
    `).run(dataAtual, dataAtual);
    db.prepare(`
      INSERT INTO livro VALUES (1, 'Livro 1', 'Ed 1', 10, 3, 'ATIVO', ?, ?)
    `).run(dataAtual, dataAtual);
    db.prepare(`
      INSERT INTO emprestimo VALUES (1, 1, 1, ?, NULL, 'PENDENTE')
    `).run(dataAtual);
    db.prepare(`
      INSERT INTO item_emprestimo VALUES (1, 1, 1, 3, 0, 0, 0)
    `).run();

    const emprestimoDAO = new EmprestimoDAO(db);
    const livroDAO = new LivroDAO(db);
    const professorDAO = new ProfessorDAO(db);
    const turmaDAO = new TurmaDAO(db);
    controller = new EmprestimoController(emprestimoDAO, livroDAO, professorDAO, turmaDAO);
  });

  afterEach(() => {
    db.close();
  });

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

  it('o canal IPC emprestimo:devolverItem processa devolução com sucesso e trata erros', async () => {
    const handlers = new Map<string, Function>();
    const modulo = carregarModulo('../main/ipc/emprestimoHandlers.ts', {
      ipcMain: { handle: (canal: string, handler: Function) => handlers.set(canal, handler) },
    });
    modulo.registerEmprestimoHandlers(controller);

    assert.ok(handlers.has(modulo.EMPRESTIMO_CHANNELS.DEVOLVER_ITEM));
    const devolverHandler = handlers.get(modulo.EMPRESTIMO_CHANNELS.DEVOLVER_ITEM)!;

    // 1. Devolução parcial bem-sucedida via canal IPC
    const resSucesso = await devolverHandler({}, 1, 1, { quantidadeDevolvida: 2 });
    assert.equal(resSucesso.success, true);
    assert.equal(resSucesso.data.quantidadeDevolvida, 2);
    assert.equal(resSucesso.data.quantidadePendente, 1);
    assert.equal(resSucesso.data.status, 'PENDENTE');

    // 2. Também aceita payload em formato de objeto único
    const resObjeto = await devolverHandler({}, {
      emprestimoId: 1,
      itemId: 1,
      quantidadeDevolvida: 1,
    });
    assert.equal(resObjeto.success, true);
    assert.equal(resObjeto.data.quantidadeDevolvida, 3);
    assert.equal(resObjeto.data.quantidadePendente, 0);
    assert.equal(resObjeto.data.status, 'CONCLUIDO');

    // 3. O status geral é atualizado no canal de detalhes e uma nova devolução é bloqueada.
    const buscarHandler = handlers.get(modulo.EMPRESTIMO_CHANNELS.BUSCAR_POR_ID)!;
    const detalhes = await buscarHandler({}, 1);
    assert.equal(detalhes.success, true);
    assert.equal(detalhes.data.status, 'CONCLUIDO');
    const resBloqueio = await devolverHandler({}, 1, 1, { quantidadeDevolvida: 1 });
    assert.equal(resBloqueio.success, false);
    assert.equal(resBloqueio.error, 'Apenas empréstimos com status "Pendente" podem receber devoluções.');

    // 4. Rejeição com erro amigável para ID inexistente
    const resErroId = await devolverHandler({}, 999, 1, { quantidadeDevolvida: 1 });
    assert.equal(resErroId.success, false);
    assert.match(resErroId.error, /Empréstimo não encontrado\./);
  });

  for (const preload of ['../main/preload.ts', '../main/preload.cjs']) {
    it(`${preload} expõe devolverItem e encaminha chamada para o canal IPC`, async () => {
      let api: any;
      const chamadas: unknown[][] = [];
      const respostaEsperada = {
        success: true,
        data: {
          id: 1,
          emprestimoId: 1,
          livroId: 1,
          quantidadeRetirada: 3,
          quantidadeDevolvida: 2,
          quantidadePendente: 1,
          status: 'PENDENTE',
        },
      };

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

      assert.ok(typeof api.emprestimo.devolverItem === 'function');
      const resultado = await api.emprestimo.devolverItem(1, 1, { quantidadeDevolvida: 2 });
      assert.deepEqual(resultado, respostaEsperada);
      assert.deepEqual(chamadas, [
        ['emprestimo:devolverItem', 1, 1, { quantidadeDevolvida: 2 }],
      ]);
    });
  }
});
