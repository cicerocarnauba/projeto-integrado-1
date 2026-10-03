import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { ProfessorDAO } from '../main/daos/ProfessorDAO.ts';
import { TurmaDAO } from '../main/daos/TurmaDAO.ts';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import { EmprestimoDAO } from '../main/daos/EmprestimoDAO.ts';
import { EmprestimoController } from '../main/controllers/EmprestimoController.ts';

describe('Testes Unitários - Realizar Empréstimo (HU19)', () => {
  let db: Database.Database;
  let professorDAO: ProfessorDAO;
  let turmaDAO: TurmaDAO;
  let livroDAO: LivroDAO;
  let emprestimoDAO: EmprestimoDAO;
  let emprestimoController: EmprestimoController;

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
                        CHECK (status IN ('ATIVO', 'INATIVO')),
        data_cadastro   TEXT NOT NULL,
        data_atualizacao TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS turma (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        nome            TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'ATIVO'
                        CHECK (status IN ('ATIVO', 'INATIVO')),
        data_cadastro   TEXT NOT NULL,
        data_atualizacao TEXT NOT NULL
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

      CREATE TABLE IF NOT EXISTS emprestimo (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        professor_id    INTEGER NOT NULL,
        turma_id        INTEGER NOT NULL,
        data_retirada   TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'PENDENTE'
                        CHECK (status IN ('PENDENTE', 'CONCLUIDO', 'CANCELADO')),
        FOREIGN KEY (professor_id) REFERENCES professor(id),
        FOREIGN KEY (turma_id)     REFERENCES turma(id)
      );

      CREATE TABLE IF NOT EXISTS item_emprestimo (
        id                      INTEGER PRIMARY KEY AUTOINCREMENT,
        emprestimo_id           INTEGER NOT NULL,
        livro_id                INTEGER NOT NULL,
        quantidade_retirada     INTEGER NOT NULL,
        quantidade_devolvida    INTEGER NOT NULL DEFAULT 0,
        quantidade_perdida      INTEGER NOT NULL DEFAULT 0,
        quantidade_danificada   INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (emprestimo_id) REFERENCES emprestimo(id),
        FOREIGN KEY (livro_id)      REFERENCES livro(id)
      );
    `);

    professorDAO = new ProfessorDAO(db);
    turmaDAO = new TurmaDAO(db);
    livroDAO = new LivroDAO(db);
    emprestimoDAO = new EmprestimoDAO(db);
    emprestimoController = new EmprestimoController(
      emprestimoDAO,
      livroDAO,
      professorDAO,
      turmaDAO
    );
  });

  // Helpers para popular o banco
  function criarProfessor(nome = 'Maria', email = 'maria@escola.com', status: 'ATIVO' | 'INATIVO' = 'ATIVO') {
    const now = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO professor (primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nome, 'Silva', email, status, now, now);
    return Number(info.lastInsertRowid);
  }

  function criarTurma(nome = 'Maternal A', status: 'ATIVO' | 'INATIVO' = 'ATIVO') {
    const now = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO turma (nome, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?)
    `).run(nome, status, now, now);
    return Number(info.lastInsertRowid);
  }

  function criarLivro(titulo = 'Dom Casmurro', quantidadeTotal = 5, status: 'ATIVO' | 'INATIVO' = 'ATIVO') {
    const now = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO livro (titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, 0, ?, ?, ?)
    `).run(titulo, 'Editora X', quantidadeTotal, status, now, now);
    return Number(info.lastInsertRowid);
  }

  // ============================================================
  // Casos de Sucesso
  // ============================================================
  describe('Casos de Sucesso', () => {
    it('deve realizar um empréstimo com um único livro', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro();

      const emprestimo = emprestimoController.realizar({
        professorId,
        turmaId,
        itens: [{ livroId, quantidade: 2 }],
      });

      assert.ok(emprestimo.id);
      assert.strictEqual(emprestimo.professorId, professorId);
      assert.strictEqual(emprestimo.turmaId, turmaId);
      assert.strictEqual(emprestimo.status, 'PENDENTE');
      assert.strictEqual(emprestimo.itens.length, 1);
      assert.strictEqual(emprestimo.itens[0].quantidadeRetirada, 2);

      // Saldo do livro deve ter sido atualizado
      const livro = livroDAO.buscarPorId(livroId);
      assert.strictEqual(livro?.quantidadeEmprestada, 2);
      assert.strictEqual(livro?.getSaldoDisponivel(), 3);
    });

    it('deve realizar um empréstimo com múltiplos livros', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroA = criarLivro('Dom Casmurro', 5);
      const livroB = criarLivro('O Cortiço', 3);
      const livroC = criarLivro('Chapeuzinho', 10);

      const emprestimo = emprestimoController.realizar({
        professorId,
        turmaId,
        itens: [
          { livroId: livroA, quantidade: 2 },
          { livroId: livroB, quantidade: 1 },
          { livroId: livroC, quantidade: 3 },
        ],
      });

      assert.strictEqual(emprestimo.itens.length, 3);
      assert.strictEqual(livroDAO.buscarPorId(livroA)?.quantidadeEmprestada, 2);
      assert.strictEqual(livroDAO.buscarPorId(livroB)?.quantidadeEmprestada, 1);
      assert.strictEqual(livroDAO.buscarPorId(livroC)?.quantidadeEmprestada, 3);
    });

    it('deve usar a data atual do sistema como data de retirada', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro();

      const antes = new Date();
      const emprestimo = emprestimoController.realizar({
        professorId,
        turmaId,
        itens: [{ livroId, quantidade: 1 }],
      });
      const depois = new Date();

      assert.ok(emprestimo.dataRetirada >= antes);
      assert.ok(emprestimo.dataRetirada <= depois);
    });

    it('deve permitir retirar todo o saldo disponível de um livro', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro('Livro Único', 3);

      const emprestimo = emprestimoController.realizar({
        professorId,
        turmaId,
        itens: [{ livroId, quantidade: 3 }],
      });

      assert.strictEqual(emprestimo.itens[0].quantidadeRetirada, 3);
      const livro = livroDAO.buscarPorId(livroId);
      assert.strictEqual(livro?.getSaldoDisponivel(), 0);
    });
  });

  // ============================================================
  // Validação do Professor
  // ============================================================
  describe('Validação do Professor', () => {
    it('deve rejeitar se o professor não existir', () => {
      const turmaId = criarTurma();
      const livroId = criarLivro();

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId: 99999,
            turmaId,
            itens: [{ livroId, quantidade: 1 }],
          }),
        /Professor não encontrado/
      );
    });

    it('deve rejeitar se o professor estiver INATIVO', () => {
      const professorId = criarProfessor('Maria', 'maria@escola.com', 'INATIVO');
      const turmaId = criarTurma();
      const livroId = criarLivro();

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [{ livroId, quantidade: 1 }],
          }),
        /professor inativo/
      );
    });
  });

  // ============================================================
  // Validação da Turma
  // ============================================================
  describe('Validação da Turma', () => {
    it('deve rejeitar se a turma não existir', () => {
      const professorId = criarProfessor();
      const livroId = criarLivro();

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId: 99999,
            itens: [{ livroId, quantidade: 1 }],
          }),
        /Turma não encontrada/
      );
    });

    it('deve rejeitar se a turma estiver INATIVA', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma('Maternal A', 'INATIVO');
      const livroId = criarLivro();

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [{ livroId, quantidade: 1 }],
          }),
        /turma inativa/
      );
    });
  });

  // ============================================================
  // Validação dos Livros
  // ============================================================
  describe('Validação dos Livros', () => {
    it('deve rejeitar se nenhum item for informado', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [],
          }),
        /pelo menos um livro/
      );
    });

    it('deve rejeitar se o livro não existir', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [{ livroId: 99999, quantidade: 1 }],
          }),
        /Livro não encontrado/
      );
    });

    it('deve rejeitar se o livro estiver INATIVO', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro('Livro Inativo', 5, 'INATIVO');

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [{ livroId, quantidade: 1 }],
          }),
        /está inativo/
      );
    });

    it('deve rejeitar quantidade zero', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro();

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [{ livroId, quantidade: 0 }],
          }),
        /maior que zero/
      );
    });

    it('deve rejeitar quantidade negativa', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro();

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [{ livroId, quantidade: -3 }],
          }),
        /maior que zero/
      );
    });

    it('deve rejeitar quantidade decimal (não inteira)', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro();

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [{ livroId, quantidade: 1.5 }],
          }),
        /maior que zero/
      );
    });

    it('deve rejeitar quando a quantidade solicitada excede o saldo disponível', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro('Livro Raro', 2);

      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [{ livroId, quantidade: 5 }],
          }),
        /Estoque insuficiente/
      );
    });

    it('deve indicar qual livro não tem saldo suficiente', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro('Livro Raro', 1);

      try {
        emprestimoController.realizar({
          professorId,
          turmaId,
          itens: [{ livroId, quantidade: 10 }],
        });
        assert.fail('Deveria ter lançado erro');
      } catch (error) {
        const msg = (error as Error).message;
        assert.match(msg, /Livro Raro/);
        assert.match(msg, /Saldo disponível: 1/);
      }
    });
  });

  // ============================================================
  // Validação de Saldo com Empréstimos Anteriores
  // ============================================================
  describe('Saldo com Empréstimos Anteriores', () => {
    it('deve considerar o saldo já comprometido por empréstimos anteriores', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro('Dom Casmurro', 5);

      // Primeiro empréstimo: retira 3
      emprestimoController.realizar({
        professorId,
        turmaId,
        itens: [{ livroId, quantidade: 3 }],
      });

      // Saldo agora é 2. Segunda retirada de 3 deve falhar.
      assert.throws(
        () =>
          emprestimoController.realizar({
            professorId,
            turmaId,
            itens: [{ livroId, quantidade: 3 }],
          }),
        /Estoque insuficiente/
      );
    });

    it('deve permitir retirada parcial após um empréstimo anterior', () => {
      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro('Dom Casmurro', 5);

      emprestimoController.realizar({
        professorId,
        turmaId,
        itens: [{ livroId, quantidade: 3 }],
      });

      // Ainda há 2 disponíveis
      const emprestimo = emprestimoController.realizar({
        professorId,
        turmaId,
        itens: [{ livroId, quantidade: 2 }],
      });

      assert.strictEqual(emprestimo.itens[0].quantidadeRetirada, 2);
      assert.strictEqual(livroDAO.buscarPorId(livroId)?.getSaldoDisponivel(), 0);
    });
  });

  // ============================================================
  // Teste do Endpoint IPC emprestimo:realizar
  // ============================================================
  describe('Teste do Endpoint POST /emprestimos (Canal IPC emprestimo:realizar)', () => {
    it('deve responder com { success: true, data } ao realizar um empréstimo', async () => {
      const handleRealizar = async (input: {
        professorId: number;
        turmaId: number;
        itens: Array<{ livroId: number; quantidade: number }>;
      }) => {
        try {
          const emprestimo = emprestimoController.realizar(input);
          return { success: true, data: emprestimo };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro();

      const response = await handleRealizar({
        professorId,
        turmaId,
        itens: [{ livroId, quantidade: 1 }],
      });

      assert.strictEqual(response.success, true);
      assert.ok(response.data);
      assert.strictEqual(response.data.status, 'PENDENTE');
    });

    it('deve responder com { success: false, error } amigável ao tentar empréstimo com livro sem saldo', async () => {
      const handleRealizar = async (input: {
        professorId: number;
        turmaId: number;
        itens: Array<{ livroId: number; quantidade: number }>;
      }) => {
        try {
          const emprestimo = emprestimoController.realizar(input);
          return { success: true, data: emprestimo };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const professorId = criarProfessor();
      const turmaId = criarTurma();
      const livroId = criarLivro('Livro Curto', 1);

      const response = await handleRealizar({
        professorId,
        turmaId,
        itens: [{ livroId, quantidade: 5 }],
      });

      assert.strictEqual(response.success, false);
      assert.ok(response.error);
      assert.match(response.error!, /Estoque insuficiente/);
    });

    it('deve responder com { success: false, error } quando o professor for inválido', async () => {
      const handleRealizar = async (input: {
        professorId: number;
        turmaId: number;
        itens: Array<{ livroId: number; quantidade: number }>;
      }) => {
        try {
          const emprestimo = emprestimoController.realizar(input);
          return { success: true, data: emprestimo };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const turmaId = criarTurma();
      const livroId = criarLivro();

      const response = await handleRealizar({
        professorId: 99999,
        turmaId,
        itens: [{ livroId, quantidade: 1 }],
      });

      assert.strictEqual(response.success, false);
      assert.match(response.error!, /Professor não encontrado/);
    });
  });
});