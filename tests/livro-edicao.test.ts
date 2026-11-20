import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import { LivroController } from '../main/controllers/LivroController.ts';

describe('Testes Unitários - HU02 Editar Livro', () => {
  let db: Database.Database;
  let livroDAO: LivroDAO;
  let livroController: LivroController;

  beforeEach(() => {
    // Banco SQLite isolado em memória para os testes
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

    const stmt = db.prepare(`
      INSERT INTO livro (titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    // Livro 1: Ativo, 10 cópias, 3 emprestadas (id: 1)
    stmt.run('O Pequeno Príncipe', 'Agir', 10, 3, 'ATIVO', now, now);
    // Livro 2: Ativo, 5 cópias, 0 emprestadas (id: 2)
    stmt.run('Dom Casmurro', 'Saraiva', 5, 0, 'ATIVO', now, now);
    // Livro 3: Inativo, 8 cópias, 0 emprestadas (id: 3)
    stmt.run('A Bolsa Amarela', 'José Olympio', 8, 0, 'INATIVO', now, now);
  });

  // ========================================================
  // 1. Regra de Status: só permite editar livro com status "Ativo"
  // ========================================================
  describe('Validação de Status do Livro', () => {
    it('deve permitir editar livro com status ATIVO', () => {
      const editado = livroController.editar({
        id: 1,
        titulo: 'O Pequeno Príncipe (Edição Especial)',
        editora: 'Agir Cultural',
        quantidadeTotal: 12,
      });

      assert.strictEqual(editado.id, 1);
      assert.strictEqual(editado.titulo, 'O Pequeno Príncipe (Edição Especial)');
      assert.strictEqual(editado.editora, 'Agir Cultural');
      assert.strictEqual(editado.quantidadeTotal, 12);
      assert.strictEqual(editado.status, 'ATIVO');
      assert.strictEqual(editado.saldoDisponivel, 9); // 12 total - 3 emprestadas
    });

    it('deve impedir a edição quando o livro estiver com status INATIVO', () => {
      assert.throws(
        () => {
          livroController.editar({
            id: 3,
            titulo: 'A Bolsa Amarela (Revista)',
            editora: 'José Olympio',
            quantidadeTotal: 10,
          });
        },
        {
          name: 'Error',
          message: 'Apenas livros com status "Ativo" podem ser editados. Livros inativos precisam ser reativados primeiro.',
        }
      );
    });

    it('deve rejeitar edição se o ID informado não existir no acervo', () => {
      assert.throws(
        () => {
          livroController.editar({
            id: 9999,
            titulo: 'Inexistente',
            editora: 'Qualquer',
            quantidadeTotal: 5,
          });
        },
        {
          name: 'Error',
          message: 'Livro não encontrado no acervo.',
        }
      );
    });
  });

  // ========================================================
  // 2. Regra de Quantidade vs Quantidade Emprestada (RN03)
  // ========================================================
  describe('Validação de Quantidade Total e Integridade de Estoque', () => {
    it('deve permitir editar quando a nova quantidade for maior que a emprestada', () => {
      // Livro 1 tem 3 emprestadas. Editando para 8.
      const editado = livroController.editar({
        id: 1,
        titulo: 'O Pequeno Príncipe',
        editora: 'Agir',
        quantidadeTotal: 8,
      });

      assert.strictEqual(editado.quantidadeTotal, 8);
      assert.strictEqual(editado.saldoDisponivel, 5); // 8 - 3
    });

    it('deve permitir editar quando a nova quantidade for exatamente igual à quantidade emprestada', () => {
      // Livro 1 tem 3 emprestadas. Editando para exatamente 3 (saldo disponível = 0).
      const editado = livroController.editar({
        id: 1,
        titulo: 'O Pequeno Príncipe',
        editora: 'Agir',
        quantidadeTotal: 3,
      });

      assert.strictEqual(editado.quantidadeTotal, 3);
      assert.strictEqual(editado.saldoDisponivel, 0); // 3 - 3
      assert.strictEqual(editado.status, 'ATIVO');
    });

    it('deve rejeitar edição quando a nova quantidade for menor que a quantidade emprestada', () => {
      // Livro 1 tem 3 emprestadas. Tentar editar para 2 cópias deve ser rejeitado.
      assert.throws(
        () => {
          livroController.editar({
            id: 1,
            titulo: 'O Pequeno Príncipe',
            editora: 'Agir',
            quantidadeTotal: 2,
          });
        },
        {
          name: 'Error',
          message: 'A nova quantidade total (2) não pode ser inferior à quantidade de cópias já emprestadas (3).',
        }
      );
    });

    it('deve rejeitar edição com quantidade total negativa', () => {
      assert.throws(
        () => {
          livroController.editar({
            id: 2,
            titulo: 'Dom Casmurro',
            editora: 'Saraiva',
            quantidadeTotal: -1,
          });
        },
        {
          name: 'Error',
          message: 'A "Quantidade Total de Cópias" deve ser um número inteiro maior ou igual a zero.',
        }
      );
    });

    it('deve rejeitar edição com quantidade decimal não inteira', () => {
      assert.throws(
        () => {
          livroController.editar({
            id: 2,
            titulo: 'Dom Casmurro',
            editora: 'Saraiva',
            quantidadeTotal: 5.5,
          });
        },
        {
          name: 'Error',
          message: 'A "Quantidade Total de Cópias" deve ser um número inteiro maior ou igual a zero.',
        }
      );
    });
  });

  // ========================================================
  // 3. Regra de Inativação Automática quando Quantidade = 0 (RN03)
  // ========================================================
  describe('Inativação Automática quando Quantidade Total é Reduzida a Zero', () => {
    it('deve mudar automaticamente o status para INATIVO quando a quantidade total for reduzida a zero', () => {
      // Livro 2 tem 0 exemplares emprestados. Reduzir para 0 deve inativar automaticamente.
      const editado = livroController.editar({
        id: 2,
        titulo: 'Dom Casmurro',
        editora: 'Saraiva',
        quantidadeTotal: 0,
      });

      assert.strictEqual(editado.quantidadeTotal, 0);
      assert.strictEqual(editado.status, 'INATIVO');
      assert.strictEqual(editado.saldoDisponivel, 0);

      // Confirma que no banco de dados o status foi persistido como INATIVO
      const livroNoBanco = livroDAO.buscarPorId(2);
      assert.strictEqual(livroNoBanco?.status, 'INATIVO');
      assert.strictEqual(livroNoBanco?.quantidadeTotal, 0);
    });
  });

  // ========================================================
  // 4. Regra de Unicidade Título + Editora na Edição (RN06)
  // ========================================================
  describe('Validação de Unicidade Título + Editora na Edição (RN06)', () => {
    it('deve permitir salvar edição mantendo o mesmo título e editora do próprio livro', () => {
      // Livro 1 mantendo título 'O Pequeno Príncipe' e editora 'Agir', alterando apenas a quantidade
      const editado = livroController.editar({
        id: 1,
        titulo: 'O Pequeno Príncipe',
        editora: 'Agir',
        quantidadeTotal: 15,
      });

      assert.strictEqual(editado.id, 1);
      assert.strictEqual(editado.quantidadeTotal, 15);
    });

    it('deve rejeitar edição se o novo título e editora coincidirem com outro livro ATIVO', () => {
      // Tentar alterar Livro 1 para o título e editora do Livro 2 ('Dom Casmurro', 'Saraiva')
      assert.throws(
        () => {
          livroController.editar({
            id: 1,
            titulo: 'Dom Casmurro',
            editora: 'Saraiva',
            quantidadeTotal: 10,
          });
        },
        {
          name: 'Error',
          message: 'Já existe outro livro cadastrado com este título e editora. Informe um título ou editora diferente.',
        }
      );
    });

    it('deve rejeitar edição se o novo título e editora coincidirem com outro livro INATIVO (RN06)', () => {
      // Livro 3 é INATIVO ('A Bolsa Amarela', 'José Olympio'). Livro 1 não pode assumir esse título + editora.
      assert.throws(
        () => {
          livroController.editar({
            id: 1,
            titulo: 'A Bolsa Amarela',
            editora: 'José Olympio',
            quantidadeTotal: 10,
          });
        },
        {
          name: 'Error',
          message: 'Já existe outro livro cadastrado com este título e editora. Informe um título ou editora diferente.',
        }
      );
    });

    it('deve rejeitar duplicidade ignorando maiúsculas e minúsculas e espaços nas pontas (RNF04)', () => {
      assert.throws(
        () => {
          livroController.editar({
            id: 1,
            titulo: '   dom casmurro   ',
            editora: '  SARAIVA  ',
            quantidadeTotal: 10,
          });
        },
        {
          name: 'Error',
          message: 'Já existe outro livro cadastrado com este título e editora. Informe um título ou editora diferente.',
        }
      );
    });

    it('deve permitir alterar para o mesmo título se a editora for diferente', () => {
      // Livro 1 com título 'Dom Casmurro', mas com editora 'Companhia das Letras' (diferente da 'Saraiva')
      const editado = livroController.editar({
        id: 1,
        titulo: 'Dom Casmurro',
        editora: 'Companhia das Letras',
        quantidadeTotal: 8,
      });

      assert.strictEqual(editado.id, 1);
      assert.strictEqual(editado.titulo, 'Dom Casmurro');
      assert.strictEqual(editado.editora, 'Companhia das Letras');
    });
  });

  // ========================================================
  // 5. Validação de Campos Obrigatórios
  // ========================================================
  describe('Validação de Campos Obrigatórios', () => {
    it('deve rejeitar edição quando o título for vazio ou em branco', () => {
      assert.throws(
        () => {
          livroController.editar({
            id: 1,
            titulo: '   ',
            editora: 'Agir',
            quantidadeTotal: 10,
          });
        },
        {
          name: 'Error',
          message: 'O campo "Título" é obrigatório.',
        }
      );
    });

    it('deve rejeitar edição quando a editora for vazia ou em branco', () => {
      assert.throws(
        () => {
          livroController.editar({
            id: 1,
            titulo: 'O Pequeno Príncipe',
            editora: '   ',
            quantidadeTotal: 10,
          });
        },
        {
          name: 'Error',
          message: 'O campo "Editora" é obrigatório.',
        }
      );
    });
  });

  // ========================================================
  // 6. Testes do Endpoint PUT /livros/{id} (Canal IPC livro:editar)
  // ========================================================
  describe('Teste do Endpoint PUT /livros/{id} (Canal IPC livro:editar)', () => {
    it('deve responder com formato { success: true, data } ao editar com sucesso', async () => {
      const handleEditar = async (id: number, input: { titulo: string; editora: string; quantidadeTotal: number }) => {
        try {
          const resultado = livroController.editar({ id, ...input });
          return { success: true, data: resultado };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleEditar(1, {
        titulo: 'O Pequeno Príncipe Ilustrado',
        editora: 'Agir',
        quantidadeTotal: 14,
      });

      assert.strictEqual(response.success, true);
      assert.ok(response.data);
      assert.strictEqual(response.data.titulo, 'O Pequeno Príncipe Ilustrado');
      assert.strictEqual(response.data.quantidadeTotal, 14);
      assert.strictEqual(response.data.saldoDisponivel, 11); // 14 - 3
    });

    it('deve responder com { success: false, error } amigável ao tentar editar livro inativo', async () => {
      const handleEditar = async (id: number, input: { titulo: string; editora: string; quantidadeTotal: number }) => {
        try {
          const resultado = livroController.editar({ id, ...input });
          return { success: true, data: resultado };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleEditar(3, {
        titulo: 'A Bolsa Amarela',
        editora: 'José Olympio',
        quantidadeTotal: 10,
      });

      assert.strictEqual(response.success, false);
      assert.strictEqual(
        response.error,
        'Apenas livros com status "Ativo" podem ser editados. Livros inativos precisam ser reativados primeiro.'
      );
    });

    it('deve responder com { success: false, error } amigável ao violar duplicidade (RNF03)', async () => {
      const handleEditar = async (id: number, input: { titulo: string; editora: string; quantidadeTotal: number }) => {
        try {
          const resultado = livroController.editar({ id, ...input });
          return { success: true, data: resultado };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleEditar(1, {
        titulo: 'Dom Casmurro',
        editora: 'Saraiva',
        quantidadeTotal: 10,
      });

      assert.strictEqual(response.success, false);
      assert.strictEqual(
        response.error,
        'Já existe outro livro cadastrado com este título e editora. Informe um título ou editora diferente.'
      );
    });

    it('deve responder com { success: false, error } ao tentar quantidade menor que a emprestada', async () => {
      const handleEditar = async (id: number, input: { titulo: string; editora: string; quantidadeTotal: number }) => {
        try {
          const resultado = livroController.editar({ id, ...input });
          return { success: true, data: resultado };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleEditar(1, {
        titulo: 'O Pequeno Príncipe',
        editora: 'Agir',
        quantidadeTotal: 1, // Livro 1 tem 3 emprestadas
      });

      assert.strictEqual(response.success, false);
      assert.strictEqual(
        response.error,
        'A nova quantidade total (1) não pode ser inferior à quantidade de cópias já emprestadas (3).'
      );
    });
  });
});
