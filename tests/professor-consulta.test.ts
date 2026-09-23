import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { ProfessorDAO } from '../main/daos/ProfessorDAO.ts';
import { ProfessorController } from '../main/controllers/ProfessorController.ts';

describe('Testes Unitários - Consulta de Professor', () => {
  let db: Database.Database;
  let professorController: ProfessorController;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE professor (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        primeiro_nome TEXT NOT NULL,
        sobrenome TEXT NOT NULL,
        email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ATIVO',
        data_cadastro TEXT NOT NULL,
        data_atualizacao TEXT NOT NULL
      );
    `);

    const professorDAO = new ProfessorDAO(db);
    professorController = new ProfessorController(professorDAO);

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO professor
        (primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run('Daniel', 'Andrade', 'daniel@ufc.br', 'ATIVO', now, now);
    stmt.run('Daniel', 'Silva', 'sonic@email.com', 'ATIVO', now, now);
    stmt.run('Ana', 'Souza', 'ana@email.com', 'ATIVO', now, now);
    stmt.run('Bruno', 'Costa', 'bruno@email.com', 'INATIVO', now, now);
  });

  it('deve encontrar os professores com o mesmo primeiro nome', () => {
    const professores = professorController.consultar({
      nome: 'Daniel',
      email: 'nao-encontrado',
    });

    assert.strictEqual(professores.length, 2);
    assert.ok(professores.every((professor) => professor.primeiroNome === 'Daniel'));
  });

  it('deve encontrar pelo nome completo', () => {
    const professores = professorController.consultar({ nome: 'Daniel Silva' });

    assert.strictEqual(professores.length, 1);
    assert.strictEqual(professores[0].sobrenome, 'Silva');
  });

  it('deve encontrar pelo nome completo de forma parcial', () => {
    const professores = professorController.consultar({ nome: 'Daniel A' });

    assert.strictEqual(professores.length, 1);
    assert.strictEqual(professores[0].sobrenome, 'Andrade');
  });

  it('deve encontrar pelo sobrenome e diferenciar homonimos', () => {
    const professores = professorController.consultar({ nome: 'Silva' });

    assert.strictEqual(professores.length, 1);
    assert.strictEqual(professores[0].primeiroNome, 'Daniel');
  });

  it('deve encontrar pelo email quando o nome nao contem o termo', () => {
    const professores = professorController.consultar({ email: 'ana@email' });

    assert.strictEqual(professores.length, 1);
    assert.strictEqual(professores[0].email, 'ana@email.com');
  });

  it('deve ignorar maiusculas e espacos nas extremidades', () => {
    const professores = professorController.consultar({ nome: '  DANIEL  ' });

    assert.strictEqual(professores.length, 2);
    assert.ok(professores.every((professor) => professor.primeiroNome === 'Daniel'));
  });

  it('deve retornar apenas ativos por padrao e incluir inativos quando solicitado', () => {
    const ativos = professorController.consultar({});
    const todos = professorController.consultar({ incluirInativos: true });

    assert.strictEqual(ativos.length, 3);
    assert.strictEqual(todos.length, 4);
    assert.ok(todos.some((professor) => professor.status === 'INATIVO'));
  });
});
