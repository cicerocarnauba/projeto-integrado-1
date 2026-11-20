import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { TurmaDAO } from '../../main/daos/TurmaDAO.ts';
import { TurmaController } from '../../main/controllers/TurmaController.ts';

describe('Testes Unitários - CRUD Turma (HU13, HU14, HU16, HU17, HU18)', () => {
  let db: Database.Database;
  let turmaDAO: TurmaDAO;
  let turmaController: TurmaController;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE IF NOT EXISTS turma (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        nome            TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'ATIVO'
                        CHECK (status IN ('ATIVO', 'INATIVO')),
        data_cadastro   TEXT NOT NULL,
        data_atualizacao TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_turma_nome_unique
        ON turma(LOWER(TRIM(nome)));
    `);

    turmaDAO = new TurmaDAO(db);
    turmaController = new TurmaController(turmaDAO);
  });

  describe('Cadastrar Turma (RF12)', () => {
    it('deve cadastrar uma turma com nome válido', () => {
      const turma = turmaController.cadastrar({ nome: 'Maternal A' });
      assert.strictEqual(turma.nome, 'Maternal A');
      assert.strictEqual(turma.status, 'ATIVO');
    });

    it('deve rejeitar nome duplicado', () => {
      turmaController.cadastrar({ nome: 'Maternal A' });
      assert.throws(
        () => turmaController.cadastrar({ nome: 'Maternal A' }),
        /Já existe uma turma/
      );
    });
  });

  describe('Editar Turma (HU14)', () => {
    it('deve editar o nome de uma turma ATIVA', () => {
      const turma = turmaController.cadastrar({ nome: 'Maternal A' });
      const editada = turmaController.editar(turma.id!, { nome: 'Maternal B' });
      assert.strictEqual(editada.nome, 'Maternal B');
    });

    it('deve rejeitar edição com nome duplicado', () => {
      turmaController.cadastrar({ nome: 'Maternal A' });
      const turmaB = turmaController.cadastrar({ nome: 'Maternal B' });

      assert.throws(
        () => turmaController.editar(turmaB.id!, { nome: 'Maternal A' }),
        /Já existe uma turma/
      );
    });
  });

  describe('Ativar Turma (HU18)', () => {
    it('deve ativar uma turma INATIVA', () => {
      const turma = turmaController.cadastrar({ nome: 'Maternal A' });
      turmaDAO.atualizarStatus(turma.id!, 'INATIVO');

      const ativada = turmaController.ativar(turma.id!);
      assert.strictEqual(ativada.status, 'ATIVO');
    });

    it('deve rejeitar ativação de turma já ATIVA', () => {
      const turma = turmaController.cadastrar({ nome: 'Maternal A' });
      assert.throws(
        () => turmaController.ativar(turma.id!),
        /já está ativa/
      );
    });
  });

  describe('Desativar Turma (HU17)', () => {
    it('deve rejeitar desativação de turma sem histórico', () => {
      const turma = turmaController.cadastrar({ nome: 'Maternal A' });
      assert.throws(
        () => turmaController.desativar(turma.id!),
        /não possui histórico de empréstimos/
      );
    });
  });

  describe('Excluir Turma (HU16)', () => {
    it('deve excluir do banco quando não há histórico', () => {
      const turma = turmaController.cadastrar({ nome: 'Maternal A' });
      const resultado = turmaController.excluir(turma.id!);

      assert.strictEqual(resultado.tipo, 'EXCLUSAO');
      assert.strictEqual(turmaDAO.buscarPorId(turma.id!), null);
    });
  });
});