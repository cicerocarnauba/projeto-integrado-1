import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import { LivroController } from '../main/controllers/LivroController.ts';

describe('Testes Unitários - HU05 Ativar Livro', () => {
  let db: Database.Database;
  let livroDAO: LivroDAO;
  let livroController: LivroController;

  beforeEach(() => {
    // Banco SQLite isolado em memória
    db = new Database(':memory:');
    db.exec(`
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
    `);

    livroDAO = new LivroDAO(db);
    livroController = new LivroController(livroDAO);

    const now = new Date('2026-01-01T00:00:00.000Z').toISOString();

    const stmt = db.prepare(`
      INSERT INTO livro (titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Livro 1: Inativo, tinha 0 cópias (id: 1)
    stmt.run('O Pequeno Príncipe', 'Agir', 0, 0, 'INATIVO', now, now);

    // Livro 2: Já Ativo, 5 cópias (id: 2)
    stmt.run('Dom Casmurro', 'Ática', 5, 0, 'ATIVO', now, now);

    // Livro 3: Inativo, com quantidade emprestada residual registrada (id: 3)
    stmt.run('Memórias Póstumas', 'Globo', 0, 2, 'INATIVO', now, now);
  });

  describe('Cenário 1: Ativação de Livro Inativo com Sucesso', () => {
    it('deve mudar status de Inativo para Ativo com a nova quantidade informada', () => {
      const resultado = livroController.ativar(1, 10);

      assert.strictEqual(resultado.livro.status, 'ATIVO');
      assert.strictEqual(resultado.livro.quantidadeTotal, 10);
      assert.strictEqual(resultado.livro.saldoDisponivel, 10);
      assert.strictEqual(resultado.mensagem, 'Livro ativado com sucesso.');

      // Verifica no banco de dados SQLite
      const livroNoBanco = livroDAO.buscarPorId(1);
      assert.ok(livroNoBanco);
      assert.strictEqual(livroNoBanco.status, 'ATIVO');
      assert.strictEqual(livroNoBanco.quantidadeTotal, 10);
      assert.strictEqual(livroNoBanco.getSaldoDisponivel(), 10);
      assert.notStrictEqual(
        livroNoBanco.dataAtualizacao.toISOString(),
        '2026-01-01T00:00:00.000Z',
        'Data de atualização deve ser renovada'
      );
    });

    it('livro ativado deve voltar a aparecer na consulta padrão (sem filtro de inativos)', () => {
      // Antes da ativação: não aparece na consulta normal
      const antes = livroController.consultar({ termo: 'Pequeno Príncipe' });
      assert.strictEqual(antes.length, 0);

      // Ativa o livro com 7 cópias
      livroController.ativar(1, 7);

      // Depois da ativação: deve aparecer normalmente na consulta do dia a dia
      const depois = livroController.consultar({ termo: 'Pequeno Príncipe' });
      assert.strictEqual(depois.length, 1);
      assert.strictEqual(depois[0].status, 'ATIVO');
      assert.strictEqual(depois[0].quantidadeTotal, 7);
    });
  });

  describe('Cenário 2: Validação da Quantidade Total (Obrigatória e > 0)', () => {
    it('deve rejeitar tentativa de ativação sem informar quantidade (undefined / null / NaN)', () => {
      assert.throws(
        () => livroController.ativar(1, undefined as any),
        {
          name: 'Error',
          message: 'Informe a nova quantidade de exemplares para ativar o livro.',
        }
      );

      assert.throws(
        () => livroController.ativar(1, null as any),
        {
          name: 'Error',
          message: 'Informe a nova quantidade de exemplares para ativar o livro.',
        }
      );

      assert.throws(
        () => livroController.ativar(1, NaN),
        {
          name: 'Error',
          message: 'Informe a nova quantidade de exemplares para ativar o livro.',
        }
      );
    });

    it('deve rejeitar ativação com quantidade zero', () => {
      assert.throws(
        () => livroController.ativar(1, 0),
        {
          name: 'Error',
          message: 'A quantidade deve ser um número inteiro maior que zero.',
        }
      );
    });

    it('deve rejeitar ativação com quantidade negativa', () => {
      assert.throws(
        () => livroController.ativar(1, -4),
        {
          name: 'Error',
          message: 'A quantidade deve ser um número inteiro maior que zero.',
        }
      );
    });

    it('deve rejeitar ativação com número fracionário (não inteiro)', () => {
      assert.throws(
        () => livroController.ativar(1, 3.5),
        {
          name: 'Error',
          message: 'A quantidade deve ser um número inteiro maior que zero.',
        }
      );
    });
  });

  describe('Cenário 3: Validações de Integridade e Regras de Negócio', () => {
    it('deve rejeitar tentativa de ativar livro que já está ATIVO', () => {
      assert.throws(
        () => livroController.ativar(2, 8),
        {
          name: 'Error',
          message: 'Este livro já está ativo.',
        }
      );
    });

    it('deve rejeitar tentativa de ativar livro inexistente', () => {
      assert.throws(
        () => livroController.ativar(9999, 5),
        {
          name: 'Error',
          message: 'Livro não encontrado no acervo.',
        }
      );
    });

    it('deve rejeitar ID inválido (zero, negativo, não inteiro ou NaN)', () => {
      assert.throws(
        () => livroController.ativar(0, 5),
        {
          name: 'Error',
          message: 'ID do livro inválido para ativação.',
        }
      );

      assert.throws(
        () => livroController.ativar(-1, 5),
        {
          name: 'Error',
          message: 'ID do livro inválido para ativação.',
        }
      );

      assert.throws(
        () => livroController.ativar(1.5, 5),
        {
          name: 'Error',
          message: 'ID do livro inválido para ativação.',
        }
      );

      assert.throws(
        () => livroController.ativar(NaN as any, 5),
        {
          name: 'Error',
          message: 'ID do livro inválido para ativação.',
        }
      );
    });

    it('deve impedir ativar livro com quantidade inferior a cópias já emprestadas', () => {
      // Livro 3 possui quantidadeEmprestada = 2
      assert.throws(
        () => livroController.ativar(3, 1),
        {
          name: 'Error',
          message: 'A nova quantidade total (1) não pode ser inferior à quantidade de cópias já emprestadas (2).',
        }
      );

      // Ativar com quantidade igual ou maior que emprestada deve ser aceito
      const ativado = livroController.ativar(3, 2);
      assert.strictEqual(ativado.livro.status, 'ATIVO');
      assert.strictEqual(ativado.livro.quantidadeTotal, 2);
      assert.strictEqual(ativado.livro.saldoDisponivel, 0);
    });
  });
});
