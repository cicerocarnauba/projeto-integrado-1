import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { ProfessorDAO } from '../main/daos/ProfessorDAO.ts';
import { ProfessorController } from '../main/controllers/ProfessorController.ts';

describe('Testes Unitários - CRUD Professor (HU08, HU10, HU11, HU12)', () => {
  let db: Database.Database;
  let professorDAO: ProfessorDAO;
  let professorController: ProfessorController;

  beforeEach(() => {
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
    `);

    professorDAO = new ProfessorDAO(db);
    professorController = new ProfessorController(professorDAO);
  });

  // ============================================================
  // Cadastrar Professor (RF07)
  // ============================================================
  describe('Cadastrar Professor', () => {
    it('deve cadastrar um professor com dados válidos', () => {
      const professor = professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      assert.strictEqual(professor.primeiroNome, 'Maria');
      assert.strictEqual(professor.sobrenome, 'Silva');
      assert.strictEqual(professor.email, 'maria@escola.com');
      assert.strictEqual(professor.status, 'ATIVO');
      assert.ok(professor.id);
    });

    it('deve rejeitar cadastro com e-mail duplicado', () => {
      professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      assert.throws(
        () =>
          professorController.cadastrar({
            primeiroNome: 'João',
            sobrenome: 'Souza',
            email: 'maria@escola.com',
          }),
        /E-mail já cadastrado/
      );
    });
  });

  // ============================================================
  // Editar Professor (HU08)
  // ============================================================
  describe('Editar Professor (HU08)', () => {
    it('deve editar os dados de um professor ATIVO', () => {
      const professor = professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      const editado = professorController.editar(professor.id!, {
        primeiroNome: 'Maria',
        sobrenome: 'Santos',
        email: 'maria.santos@escola.com',
      });

      assert.strictEqual(editado.sobrenome, 'Santos');
      assert.strictEqual(editado.email, 'maria.santos@escola.com');
    });

    it('deve rejeitar edição quando o novo e-mail já pertence a outro professor', () => {
      professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      const joao = professorController.cadastrar({
        primeiroNome: 'João',
        sobrenome: 'Souza',
        email: 'joao@escola.com',
      });

      assert.throws(
        () =>
          professorController.editar(joao.id!, {
            primeiroNome: 'João',
            sobrenome: 'Souza',
            email: 'maria@escola.com',
          }),
        /E-mail já cadastrado/
      );
    });

    it('deve rejeitar edição de professor INATIVO', () => {
      const professor = professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      // Desativa manualmente via DAO
      professorDAO.atualizarStatus(professor.id!, 'INATIVO');

      assert.throws(
        () =>
          professorController.editar(professor.id!, {
            primeiroNome: 'Maria',
            sobrenome: 'Silva',
            email: 'maria@escola.com',
          }),
        /Não é possível editar um professor inativo/
      );
    });
  });

  // ============================================================
  // Excluir Professor (HU10)
  // ============================================================
  describe('Excluir Professor (HU10)', () => {
    it('deve excluir do banco quando não há histórico', () => {
      const professor = professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      const resultado = professorController.excluir(professor.id!);

      assert.strictEqual(resultado.tipo, 'EXCLUSAO');
      assert.strictEqual(professorDAO.buscarPorId(professor.id!), null);
    });
  });

  // ============================================================
  // Desativar Professor (HU11)
  // ============================================================
  describe('Desativar Professor (HU11)', () => {
    it('deve rejeitar desativação de professor que não tem histórico', () => {
      const professor = professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      assert.throws(
        () => professorController.desativar(professor.id!),
        /não possui histórico de empréstimos/
      );
    });

    it('deve rejeitar desativação de professor já inativo', () => {
      const professor = professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      professorDAO.atualizarStatus(professor.id!, 'INATIVO');

      assert.throws(
        () => professorController.desativar(professor.id!),
        /já está inativo/
      );
    });
  });

  // ============================================================
  // Reativar Professor (HU12)
  // ============================================================
  describe('Reativar Professor (HU12)', () => {
    it('deve reativar um professor INATIVO', () => {
      const professor = professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      // Desativa manualmente via DAO para simular cenário
      professorDAO.atualizarStatus(professor.id!, 'INATIVO');

      const reativado = professorController.reativar(professor.id!);

      assert.strictEqual(reativado.status, 'ATIVO');
    });

    it('deve rejeitar reativação de professor já ATIVO', () => {
      const professor = professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      assert.throws(
        () => professorController.reativar(professor.id!),
        /já está ativo/
      );
    });
  });
  // ============================================================
  // Buscar por ID (apoio ao fluxo de Detalhes/Edição)
  // ============================================================
  describe('Buscar por ID', () => {
    it('deve retornar o professor quando o ID existe', () => {
      const professor = professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      const encontrado = professorController.buscarPorId(professor.id!);

      assert.strictEqual(encontrado.id, professor.id);
      assert.strictEqual(encontrado.email, 'maria@escola.com');
    });

    it('deve lançar erro quando o ID não existe', () => {
      assert.throws(
        () => professorController.buscarPorId(99999),
        /Professor não encontrado/
      );
    });
  });

  // ============================================================
  // Consultar Professor (RF09)
  // ============================================================
  describe('Consultar Professor (RF09)', () => {
    it('deve listar apenas professores ATIVOS por padrão', () => {
      professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      const joao = professorController.cadastrar({
        primeiroNome: 'João',
        sobrenome: 'Souza',
        email: 'joao@escola.com',
      });

      professorDAO.atualizarStatus(joao.id!, 'INATIVO');

      const ativos = professorController.consultar({});
      assert.strictEqual(ativos.length, 1);
      assert.strictEqual(ativos[0].email, 'maria@escola.com');
    });

    it('deve listar inativos quando incluirInativos = true', () => {
      professorController.cadastrar({
        primeiroNome: 'Maria',
        sobrenome: 'Silva',
        email: 'maria@escola.com',
      });

      const joao = professorController.cadastrar({
        primeiroNome: 'João',
        sobrenome: 'Souza',
        email: 'joao@escola.com',
      });

      professorDAO.atualizarStatus(joao.id!, 'INATIVO');

      const todos = professorController.consultar({ incluirInativos: true });
      assert.strictEqual(todos.length, 2);
    });
  });
});