import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { ProfessorDAO } from '../main/daos/ProfessorDAO.ts';
import { ProfessorController } from '../main/controllers/ProfessorController.ts';
import { TurmaDAO } from '../main/daos/TurmaDAO.ts';
import { TurmaController } from '../main/controllers/TurmaController.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function criarBancoEmMemoria(): Database.Database {
  const db = new Database(':memory:');

  db.exec(`
    CREATE TABLE professor (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      primeiro_nome    TEXT NOT NULL,
      sobrenome        TEXT NOT NULL,
      email            TEXT NOT NULL UNIQUE,
      status           TEXT NOT NULL DEFAULT 'ATIVO'
                       CHECK (status IN ('ATIVO', 'INATIVO')),
      data_cadastro    TEXT NOT NULL,
      data_atualizacao TEXT NOT NULL
    );

    CREATE TABLE turma (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      nome             TEXT NOT NULL,
      status           TEXT NOT NULL DEFAULT 'ATIVO'
                       CHECK (status IN ('ATIVO', 'INATIVO')),
      data_cadastro    TEXT NOT NULL,
      data_atualizacao TEXT NOT NULL
    );

    CREATE TABLE emprestimo (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      professor_id   INTEGER NOT NULL,
      turma_id       INTEGER NOT NULL,
      data_retirada  TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'PENDENTE'
                     CHECK (status IN ('PENDENTE', 'CONCLUIDO', 'CANCELADO')),
      FOREIGN KEY (professor_id) REFERENCES professor(id),
      FOREIGN KEY (turma_id)     REFERENCES turma(id)
    );
  `);

  return db;
}

function inserirEmprestimo(
  db: Database.Database,
  professorId: number,
  turmaId: number,
  status: 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO'
): void {
  db.prepare(`
    INSERT INTO emprestimo (professor_id, turma_id, data_retirada, status)
    VALUES (?, ?, ?, ?)
  `).run(professorId, turmaId, new Date().toISOString(), status);
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe('Testes Unitários - Professor: possuiHistorico e Desativar', () => {
  let db: Database.Database;
  let professorDAO: ProfessorDAO;
  let professorController: ProfessorController;
  let turmaDAO: TurmaDAO;
  let turmaController: TurmaController;

  beforeEach(() => {
    db = criarBancoEmMemoria();
    professorDAO = new ProfessorDAO(db);
    professorController = new ProfessorController(professorDAO);
    turmaDAO = new TurmaDAO(db);
    turmaController = new TurmaController(turmaDAO);
  });

  // =========================================================================
  // Bloco 1 — possuiHistoricoEmprestimos no DAO
  // =========================================================================

  describe('Bloco 1 — ProfessorDAO.possuiHistoricoEmprestimos', () => {
    it('deve retornar false quando o professor não tem nenhum empréstimo', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Ana',
        sobrenome: 'Silva',
        email: 'ana@escola.com',
      });

      const temHistorico = professorDAO.possuiHistoricoEmprestimos(p.id!);
      assert.equal(temHistorico, false);
    });

    it('deve retornar true quando o professor tem empréstimo PENDENTE', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Bruno',
        sobrenome: 'Souza',
        email: 'bruno@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal A' });

      inserirEmprestimo(db, p.id!, t.id!, 'PENDENTE');

      assert.equal(professorDAO.possuiHistoricoEmprestimos(p.id!), true);
    });

    it('deve retornar true quando o professor tem empréstimo CONCLUIDO', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Carla',
        sobrenome: 'Lima',
        email: 'carla@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal B' });

      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');

      assert.equal(professorDAO.possuiHistoricoEmprestimos(p.id!), true);
    });

    it('deve retornar true quando o professor tem empréstimo CANCELADO', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Diego',
        sobrenome: 'Reis',
        email: 'diego@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal C' });

      inserirEmprestimo(db, p.id!, t.id!, 'CANCELADO');

      assert.equal(professorDAO.possuiHistoricoEmprestimos(p.id!), true);
    });

    it('não deve confundir histórico de outro professor', () => {
      const p1 = professorController.cadastrar({
        primeiroNome: 'Eva',
        sobrenome: 'Moraes',
        email: 'eva@escola.com',
      });
      const p2 = professorController.cadastrar({
        primeiroNome: 'Fábio',
        sobrenome: 'Nunes',
        email: 'fabio@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal D' });

      inserirEmprestimo(db, p1.id!, t.id!, 'CONCLUIDO');

      assert.equal(professorDAO.possuiHistoricoEmprestimos(p1.id!), true);
      assert.equal(professorDAO.possuiHistoricoEmprestimos(p2.id!), false);
    });
  });

  // =========================================================================
  // Bloco 2 — possuiEmprestimoPendente no DAO
  // =========================================================================

  describe('Bloco 2 — ProfessorDAO.possuiEmprestimoPendente', () => {
    it('deve retornar false quando não há empréstimo pendente', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Gabi',
        sobrenome: 'Torres',
        email: 'gabi@escola.com',
      });

      assert.equal(professorDAO.possuiEmprestimoPendente(p.id!), false);
    });

    it('deve retornar true quando existe empréstimo PENDENTE', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Hugo',
        sobrenome: 'Andrade',
        email: 'hugo@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal E' });

      inserirEmprestimo(db, p.id!, t.id!, 'PENDENTE');

      assert.equal(professorDAO.possuiEmprestimoPendente(p.id!), true);
    });

    it('deve retornar false quando o único empréstimo está CONCLUIDO', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Iara',
        sobrenome: 'Pires',
        email: 'iara@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal F' });

      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');

      assert.equal(professorDAO.possuiEmprestimoPendente(p.id!), false);
    });

    it('deve retornar false quando o único empréstimo está CANCELADO', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'João',
        sobrenome: 'Vieira',
        email: 'joao@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal G' });

      inserirEmprestimo(db, p.id!, t.id!, 'CANCELADO');

      assert.equal(professorDAO.possuiEmprestimoPendente(p.id!), false);
    });
  });

  // =========================================================================
  // Bloco 3 — ProfessorController.consultar retorna possuiHistorico
  // =========================================================================

  describe('Bloco 3 — Consultar Professor retorna possuiHistorico', () => {
    it('deve retornar possuiHistorico = false para professor sem empréstimos', () => {
      professorController.cadastrar({
        primeiroNome: 'Kátia',
        sobrenome: 'Lopes',
        email: 'katia@escola.com',
      });

      const lista = professorController.consultar({});
      assert.equal(lista.length, 1);
      assert.equal(lista[0].possuiHistorico, false);
    });

    it('deve retornar possuiHistorico = true para professor com empréstimo', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Lucas',
        sobrenome: 'Mendes',
        email: 'lucas@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal H' });
      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');

      const lista = professorController.consultar({});
      const encontrado = lista.find((x) => x.id === p.id);
      assert.ok(encontrado);
      assert.equal(encontrado!.possuiHistorico, true);
    });

    it('deve calcular possuiHistorico por item individualmente', () => {
      const comHistorico = professorController.cadastrar({
        primeiroNome: 'Marina',
        sobrenome: 'Rocha',
        email: 'marina@escola.com',
      });
      professorController.cadastrar({
        primeiroNome: 'Nélio',
        sobrenome: 'Barros',
        email: 'nelio@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal I' });
      inserirEmprestimo(db, comHistorico.id!, t.id!, 'CONCLUIDO');

      const lista = professorController.consultar({});
      assert.equal(lista.length, 2);

      const m = lista.find((x) => x.email === 'marina@escola.com');
      const n = lista.find((x) => x.email === 'nelio@escola.com');

      assert.equal(m!.possuiHistorico, true);
      assert.equal(n!.possuiHistorico, false);
    });

    it('deve retornar todos os campos originais do professor no DTO', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Otávio',
        sobrenome: 'Cunha',
        email: 'otavio@escola.com',
      });

      const lista = professorController.consultar({});
      const item = lista[0];

      assert.equal(item.id, p.id);
      assert.equal(item.primeiroNome, 'Otávio');
      assert.equal(item.sobrenome, 'Cunha');
      assert.equal(item.email, 'otavio@escola.com');
      assert.equal(item.status, 'ATIVO');
      assert.ok(item.dataCadastro instanceof Date);
      assert.ok(item.dataAtualizacao instanceof Date);
      assert.equal(typeof item.possuiHistorico, 'boolean');
    });
  });

  // =========================================================================
  // Bloco 4 — ProfessorController.buscarPorId retorna possuiHistorico
  // =========================================================================

  describe('Bloco 4 — Buscar por ID retorna possuiHistorico', () => {
    it('deve retornar possuiHistorico = false para professor sem empréstimos', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Paula',
        sobrenome: 'Freitas',
        email: 'paula@escola.com',
      });

      const dto = professorController.buscarPorId(p.id!);
      assert.equal(dto.possuiHistorico, false);
      assert.equal(dto.id, p.id);
    });

    it('deve retornar possuiHistorico = true para professor com histórico', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Rafael',
        sobrenome: 'Cardoso',
        email: 'rafael@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal J' });
      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');

      const dto = professorController.buscarPorId(p.id!);
      assert.equal(dto.possuiHistorico, true);
    });

    it('deve lançar erro quando o ID não existe', () => {
      assert.throws(
        () => professorController.buscarPorId(9999),
        /Professor não encontrado/
      );
    });
  });

  // =========================================================================
  // Bloco 5 — Desativar Professor (com regras reais)
  // =========================================================================

  describe('Bloco 5 — Desativar Professor', () => {
    it('deve rejeitar quando o professor não existe', () => {
      assert.throws(
        () => professorController.desativar(9999),
        /Professor não encontrado/
      );
    });

    it('deve rejeitar quando o professor já está INATIVO', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Sofia',
        sobrenome: 'Azevedo',
        email: 'sofia@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal K' });
      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');
      professorController.desativar(p.id!); // 1ª vez OK

      assert.throws(
        () => professorController.desativar(p.id!),
        /já está inativo/i
      );
    });

    it('deve rejeitar quando o professor possui empréstimo PENDENTE', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Tiago',
        sobrenome: 'Farias',
        email: 'tiago@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal L' });
      inserirEmprestimo(db, p.id!, t.id!, 'PENDENTE');

      assert.throws(
        () => professorController.desativar(p.id!),
        /empréstimos pendentes/i
      );
    });

    it('deve rejeitar quando o professor NÃO possui histórico', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Úrsula',
        sobrenome: 'Neves',
        email: 'ursula@escola.com',
      });

      assert.throws(
        () => professorController.desativar(p.id!),
        /não possui histórico/i
      );
    });

    it('deve desativar com sucesso quando possui histórico e não há pendente', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Vanessa',
        sobrenome: 'Ramos',
        email: 'vanessa@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal M' });
      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');

      const resultado = professorController.desativar(p.id!);
      assert.equal(resultado.status, 'INATIVO');

      const atualizado = professorDAO.buscarPorId(p.id!);
      assert.equal(atualizado!.status, 'INATIVO');
    });
  });

  // =========================================================================
  // Bloco 6 — Excluir Professor (comportamento novo, com dados reais)
  // =========================================================================

  describe('Bloco 6 — Excluir Professor', () => {
    it('deve excluir fisicamente quando não há histórico', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Wagner',
        sobrenome: 'Duarte',
        email: 'wagner@escola.com',
      });

      const resultado = professorController.excluir(p.id!);
      assert.equal(resultado.tipo, 'EXCLUSAO');
      assert.equal(professorDAO.buscarPorId(p.id!), null);
    });

    it('deve desativar (não excluir) quando há histórico', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Xênia',
        sobrenome: 'Castro',
        email: 'xenia@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal N' });
      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');

      const resultado = professorController.excluir(p.id!);
      assert.equal(resultado.tipo, 'DESATIVACAO');

      const persistido = professorDAO.buscarPorId(p.id!);
      assert.ok(persistido);
      assert.equal(persistido!.status, 'INATIVO');
    });

    it('deve bloquear quando existe empréstimo PENDENTE', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Yuri',
        sobrenome: 'Peixoto',
        email: 'yuri@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal O' });
      inserirEmprestimo(db, p.id!, t.id!, 'PENDENTE');

      assert.throws(
        () => professorController.excluir(p.id!),
        /empréstimos pendentes/i
      );
    });
  });

  // =========================================================================
  // Bloco 7 — Reativar Professor
  // =========================================================================

  describe('Bloco 7 — Reativar Professor', () => {
    it('deve reativar com sucesso um professor INATIVO', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Zeca',
        sobrenome: 'Moura',
        email: 'zeca@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal P' });
      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');
      professorController.desativar(p.id!);

      const reativado = professorController.reativar(p.id!);
      assert.equal(reativado.status, 'ATIVO');

      const persistido = professorDAO.buscarPorId(p.id!);
      assert.equal(persistido!.status, 'ATIVO');
    });

    it('deve rejeitar reativar um professor que já está ATIVO', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Amanda',
        sobrenome: 'Bastos',
        email: 'amanda@escola.com',
      });

      assert.throws(
        () => professorController.reativar(p.id!),
        /já está ativo/i
      );
    });
  });

  // =========================================================================
  // Bloco 8 — Contrato do Endpoint (formato da resposta IPC)
  // =========================================================================

  describe('Bloco 8 — Contrato do Endpoint IPC', () => {
    it('deve simular o retorno de professor:consultar com possuiHistorico', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Beatriz',
        sobrenome: 'Fonseca',
        email: 'beatriz@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal Q' });
      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');

      // simula o handler IPC
      const resposta = {
        success: true,
        data: professorController.consultar({ incluirInativos: true }),
      };

      assert.equal(resposta.success, true);
      assert.ok(Array.isArray(resposta.data));
      assert.equal(typeof resposta.data[0].possuiHistorico, 'boolean');
      assert.equal(resposta.data[0].possuiHistorico, true);
    });

    it('deve simular o retorno de professor:buscarPorId com possuiHistorico', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Caio',
        sobrenome: 'Bentes',
        email: 'caio@escola.com',
      });

      const resposta = {
        success: true,
        data: professorController.buscarPorId(p.id!),
      };

      assert.equal(resposta.success, true);
      assert.equal(typeof resposta.data.possuiHistorico, 'boolean');
      assert.equal(resposta.data.possuiHistorico, false);
    });

    it('deve simular o retorno de erro amigável do professor:desativar', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Dalva',
        sobrenome: 'Xavier',
        email: 'dalva@escola.com',
      });

      let resposta: { success: boolean; error?: string };
      try {
        professorController.desativar(p.id!);
        resposta = { success: true };
      } catch (error) {
        resposta = { success: false, error: (error as Error).message };
      }

      assert.equal(resposta.success, false);
      assert.match(resposta.error ?? '', /não possui histórico/i);
    });

    it('deve simular sucesso do professor:desativar quando possui histórico', () => {
      const p = professorController.cadastrar({
        primeiroNome: 'Elias',
        sobrenome: 'Prado',
        email: 'elias@escola.com',
      });
      const t = turmaController.cadastrar({ nome: 'Maternal R' });
      inserirEmprestimo(db, p.id!, t.id!, 'CONCLUIDO');

      const resposta = {
        success: true,
        data: professorController.desativar(p.id!),
      };

      assert.equal(resposta.success, true);
      assert.equal(resposta.data.status, 'INATIVO');
    });
  });
});