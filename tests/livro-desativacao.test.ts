import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import { LivroController } from '../main/controllers/LivroController.ts';

describe('Testes Unitários - HU04 Desativar Livro Manualmente', () => {
  let db: Database.Database;
  let livroDAO: LivroDAO;
  let livroController: LivroController;

  beforeEach(() => {
    // Banco SQLite isolado em memória
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE IF NOT EXISTS professor (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        primeiro_nome   TEXT NOT NULL,
        sobrenome       TEXT NOT NULL,
        email           TEXT NOT NULL UNIQUE,
        status          TEXT NOT NULL DEFAULT 'ATIVO'
      );

      CREATE TABLE IF NOT EXISTS turma (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        nome            TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'ATIVO'
      );

      CREATE TABLE IF NOT EXISTS livro (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo                TEXT NOT NULL,
        editora               TEXT NOT NULL,
        quantidade_total      INTEGER NOT NULL,
        quantidade_emprestada INTEGER NOT NULL DEFAULT 0,
        status                TEXT NOT NULL DEFAULT 'ATIVO'
                              CHECK (status IN ('ATIVO', 'INATIVO')),
        data_cadastro         TEXT NOT NULL,
        data_atualizacao      TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_livro_titulo_editora_unique
        ON livro(LOWER(TRIM(titulo)), LOWER(TRIM(editora)));

      CREATE TABLE IF NOT EXISTS emprestimo (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        professor_id    INTEGER NOT NULL,
        turma_id        INTEGER NOT NULL,
        data_retirada   TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'PENDENTE'
                        CHECK (status IN ('PENDENTE', 'CONCLUIDO', 'CANCELADO'))
      );

      CREATE TABLE IF NOT EXISTS item_emprestimo (
        id                      INTEGER PRIMARY KEY AUTOINCREMENT,
        emprestimo_id           INTEGER NOT NULL,
        livro_id                INTEGER NOT NULL,
        quantidade_retirada     INTEGER NOT NULL,
        quantidade_devolvida    INTEGER NOT NULL DEFAULT 0,
        quantidade_perdida      INTEGER NOT NULL DEFAULT 0,
        quantidade_danificada   INTEGER NOT NULL DEFAULT 0
      );
    `);

    livroDAO = new LivroDAO(db);
    livroController = new LivroController(livroDAO);

    const now = new Date().toISOString();

    // Inserir registros base
    db.prepare(`INSERT INTO professor (primeiro_nome, sobrenome, email) VALUES (?, ?, ?)`).run('Maria', 'Silva', 'maria@escola.com');
    db.prepare(`INSERT INTO turma (nome) VALUES (?)`).run('5º Ano A');

    const stmtLivro = db.prepare(`
      INSERT INTO livro (titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Livro 1: Ativo, sem histórico e sem empréstimo (id: 1)
    stmtLivro.run('Dom Casmurro', 'Editora A', 5, 0, 'ATIVO', now, now);

    // Livro 2: Ativo, com empréstimo pendente ativo (id: 2)
    stmtLivro.run('O Alquimista', 'Editora B', 10, 1, 'ATIVO', now, now);
    db.prepare(`INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, status) VALUES (1, 1, 1, ?, 'PENDENTE')`).run(now);
    db.prepare(`INSERT INTO item_emprestimo (emprestimo_id, livro_id, quantidade_retirada) VALUES (1, 2, 1)`).run();

    // Livro 3: Ativo, com histórico concluído e sem pendências (id: 3)
    stmtLivro.run('Capitães da Areia', 'Editora C', 6, 0, 'ATIVO', now, now);
    db.prepare(`INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, status) VALUES (2, 1, 1, ?, 'CONCLUIDO')`).run(now);
    db.prepare(`INSERT INTO item_emprestimo (emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida) VALUES (2, 3, 2, 2)`).run();

    // Livro 4: Já Inativo (id: 4)
    stmtLivro.run('Memórias Póstumas', 'Editora D', 3, 0, 'INATIVO', now, now);
  });

  describe('Cenário 1: Desativação manual com sucesso', () => {
    it('deve desativar com sucesso um livro Ativo sem empréstimo pendente e sem histórico', () => {
      const resultado = livroController.desativar(1);

      assert.strictEqual(resultado.livro.status, 'INATIVO');
      assert.strictEqual(resultado.livro.quantidadeTotal, 0);
      assert.strictEqual(resultado.livro.saldoDisponivel, 0);
      assert.strictEqual(resultado.mensagem, 'Livro desativado com sucesso.');

      const noBanco = livroDAO.buscarPorId(1);
      assert.ok(noBanco);
      assert.strictEqual(noBanco.status, 'INATIVO');
      assert.strictEqual(noBanco.quantidadeTotal, 0);
    });

    it('deve permitir desativação mesmo para livro COM histórico concluído (não depende de histórico)', () => {
      // Livro 3 tem histórico de empréstimo concluído, mas sem pendências
      const resultado = livroController.desativar(3);

      assert.strictEqual(resultado.livro.status, 'INATIVO');
      assert.strictEqual(resultado.livro.quantidadeTotal, 0);
      assert.strictEqual(resultado.livro.saldoDisponivel, 0);
      assert.strictEqual(resultado.mensagem, 'Livro desativado com sucesso.');

      const noBanco = livroDAO.buscarPorId(3);
      assert.ok(noBanco);
      assert.strictEqual(noBanco.status, 'INATIVO');
      assert.strictEqual(noBanco.quantidadeTotal, 0);
    });

    it('livro desativado não deve aparecer na consulta padrão, mas deve constar com incluirInativos: true', () => {
      livroController.desativar(1);

      const consultaPadrao = livroController.consultar({ termo: 'Dom Casmurro' });
      assert.strictEqual(consultaPadrao.length, 0, 'Livro inativo não deve aparecer nas operações do dia a dia');

      const consultaHistorico = livroController.consultar({ termo: 'Dom Casmurro', incluirInativos: true });
      assert.strictEqual(consultaHistorico.length, 1, 'Livro inativo deve continuar consultável no histórico');
      assert.strictEqual(consultaHistorico[0].status, 'INATIVO');
    });
  });

  describe('Cenário 2: Bloqueio quando houver empréstimo pendente', () => {
    it('deve bloquear a desativação se existir empréstimo PENDENTE associado ao livro', () => {
      assert.throws(
        () => livroController.desativar(2),
        {
          name: 'Error',
          message: 'Não é possível desativar este livro, pois ele possui empréstimos pendentes.',
        }
      );

      // Garante que o status permanece ATIVO
      const noBanco = livroDAO.buscarPorId(2);
      assert.ok(noBanco);
      assert.strictEqual(noBanco.status, 'ATIVO');
    });

    it('deve bloquear a desativação se quantidadeEmprestada for maior que zero', () => {
      // Cadastra livro com quantidadeEmprestada > 0
      const agora = new Date().toISOString();
      const info = db.prepare(`
        INSERT INTO livro (titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
        VALUES ('Livro Teste', 'Editora Teste', 5, 2, 'ATIVO', ?, ?)
      `).run(agora, agora);

      const novoId = Number(info.lastInsertRowid);

      assert.throws(
        () => livroController.desativar(novoId),
        {
          name: 'Error',
          message: 'Não é possível desativar este livro, pois ele possui empréstimos pendentes.',
        }
      );
    });

    it('deve permitir desativação após a conclusão de todos os empréstimos pendentes', () => {
      // Atualiza o empréstimo pendente para CONCLUIDO e zera quantidadeEmprestada
      db.prepare(`UPDATE emprestimo SET status = 'CONCLUIDO' WHERE id = 1`).run();
      db.prepare(`UPDATE livro SET quantidade_emprestada = 0 WHERE id = 2`).run();

      const resultado = livroController.desativar(2);
      assert.strictEqual(resultado.livro.status, 'INATIVO');
      assert.strictEqual(resultado.mensagem, 'Livro desativado com sucesso.');
    });
  });

  describe('Cenário 3: Validações e Tratamento de Exceções', () => {
    it('deve rejeitar desativação de um livro que já está INATIVO', () => {
      assert.throws(
        () => livroController.desativar(4),
        {
          name: 'Error',
          message: 'Apenas livros com status "Ativo" podem ser desativados.',
        }
      );
    });

    it('deve rejeitar desativação de livro inexistente', () => {
      assert.throws(
        () => livroController.desativar(999),
        {
          name: 'Error',
          message: 'Livro não encontrado no acervo.',
        }
      );
    });

    it('deve rejeitar ID inválido (zero, negativo ou não inteiro)', () => {
      assert.throws(
        () => livroController.desativar(0),
        {
          name: 'Error',
          message: 'ID do livro inválido para desativação.',
        }
      );

      assert.throws(
        () => livroController.desativar(-3),
        {
          name: 'Error',
          message: 'ID do livro inválido para desativação.',
        }
      );

      assert.throws(
        () => livroController.desativar(NaN as any),
        {
          name: 'Error',
          message: 'ID do livro inválido para desativação.',
        }
      );
    });
  });

  describe('Cenário 4: Confirmação da regra do cartão - Exclusão com histórico preserva registro como Inativo', () => {
    it('dado um livro com pelo menos um empréstimo no histórico, quando solicita a exclusão, muda para Inativo e continua consultável', () => {
      // Livro 3 possui histórico concluído
      const resultadoExclusao = livroController.excluir(3);

      assert.strictEqual(resultadoExclusao.acao, 'DESATIVADO');
      assert.ok(resultadoExclusao.livro);
      assert.strictEqual(resultadoExclusao.livro.status, 'INATIVO');
      assert.strictEqual(resultadoExclusao.livro.quantidadeTotal, 0);

      // Verifica se continua consultável com incluirInativos
      const consulta = livroController.consultar({ termo: 'Capitães da Areia', incluirInativos: true });
      assert.strictEqual(consulta.length, 1);
      assert.strictEqual(consulta[0].status, 'INATIVO');
      assert.strictEqual(consulta[0].quantidadeTotal, 0);
    });
  });
});
