import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { Livro } from '../main/entities/Livro.ts';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import { LivroController } from '../main/controllers/LivroController.ts';

describe('Testes Unitários - Módulo de Livro', () => {
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
  });

  // ========================================================
  // 1. Testes de Quantidade e Validações da Entidade Livro
  // ========================================================
  describe('Validações de Quantidade e Campos Obrigatórios', () => {
    it('deve instanciar um livro com status ATIVO e saldo total quando quantidade > 0', () => {
      const livro = new Livro({
        titulo: 'O Menino Maluquinho',
        editora: 'Melhoramentos',
        quantidadeTotal: 5,
      });

      livro.validarCamposObrigatorios();

      assert.strictEqual(livro.titulo, 'O Menino Maluquinho');
      assert.strictEqual(livro.editora, 'Melhoramentos');
      assert.strictEqual(livro.quantidadeTotal, 5);
      assert.strictEqual(livro.quantidadeEmprestada, 0);
      assert.strictEqual(livro.getSaldoDisponivel(), 5);
      assert.strictEqual(livro.status, 'ATIVO');
    });

    it('deve rejeitar cadastro com quantidade zero (RN03)', () => {
      const livro = new Livro({
        titulo: 'Chapeuzinho Vermelho',
        editora: 'Ática',
        quantidadeTotal: 0,
      });

      assert.throws(
        () => livro.validarCamposObrigatorios(),
        /A "Quantidade Total de Cópias" deve ser um número inteiro maior que zero\./
      );
    });

    it('deve rejeitar cadastro com quantidade negativa (RN03)', () => {
      const livro = new Livro({
        titulo: 'Os Três Porquinhos',
        editora: 'Ciranda Cultural',
        quantidadeTotal: -3,
      });

      assert.throws(
        () => livro.validarCamposObrigatorios(),
        /A "Quantidade Total de Cópias" deve ser um número inteiro maior que zero\./
      );
    });

    it('deve rejeitar cadastro com quantidade decimal não inteira', () => {
      const livro = new Livro({
        titulo: 'Pinóquio',
        editora: 'FDT',
        quantidadeTotal: 2.5,
      });

      assert.throws(
        () => livro.validarCamposObrigatorios(),
        /A "Quantidade Total de Cópias" deve ser um número inteiro maior que zero\./
      );
    });

    it('deve rejeitar cadastro quando o título estiver vazio ou em branco', () => {
      const livro = new Livro({
        titulo: '   ',
        editora: 'Moderna',
        quantidadeTotal: 4,
      });

      assert.throws(
        () => livro.validarCamposObrigatorios(),
        /O campo "Título" é obrigatório\./
      );
    });

    it('deve rejeitar cadastro quando a editora estiver vazia ou em branco', () => {
      const livro = new Livro({
        titulo: 'O Pica-pau Amarelo',
        editora: '',
        quantidadeTotal: 2,
      });

      assert.throws(
        () => livro.validarCamposObrigatorios(),
        /O campo "Editora" é obrigatório\./
      );
    });
  });

  // ========================================================
  // 2. Testes de Regra de Negócio de Unicidade (RN06, RNF04)
  // ========================================================
  describe('Regras de Negócio de Unicidade', () => {
    it('deve cadastrar um livro inédito com sucesso', () => {
      const livro = livroController.cadastrar({
        titulo: 'Reinações de Narizinho',
        editora: 'Globo',
        quantidadeTotal: 10,
      });

      assert.ok(livro.id);
      assert.strictEqual(livro.titulo, 'Reinações de Narizinho');
      assert.strictEqual(livro.editora, 'Globo');
      assert.strictEqual(livro.status, 'ATIVO');
    });

    it('deve rejeitar cadastro duplicado com mesmo título e editora exatos (RN06)', () => {
      livroController.cadastrar({
        titulo: 'Dom Casmurro',
        editora: 'Ática',
        quantidadeTotal: 3,
      });

      assert.throws(
        () =>
          livroController.cadastrar({
            titulo: 'Dom Casmurro',
            editora: 'Ática',
            quantidadeTotal: 5,
          }),
        /Já existe um livro cadastrado com este título e editora\./
      );
    });

    it('deve rejeitar duplicidade ignorando maiúsculas e minúsculas (RN06, RNF04)', () => {
      livroController.cadastrar({
        titulo: 'A Bolsa Amarela',
        editora: 'José Olympio',
        quantidadeTotal: 4,
      });

      assert.throws(
        () =>
          livroController.cadastrar({
            titulo: 'a bolsa amarela',
            editora: 'JOSÉ OLYMPIO',
            quantidadeTotal: 2,
          }),
        /Já existe um livro cadastrado com este título e editora\./
      );
    });

    it('deve rejeitar duplicidade ignorando espaços extras nas extremidades (RNF04)', () => {
      livroController.cadastrar({
        titulo: 'Marcelo, Marmelo, Martelo',
        editora: 'Salamandra',
        quantidadeTotal: 6,
      });

      assert.throws(
        () =>
          livroController.cadastrar({
            titulo: '   Marcelo, Marmelo, Martelo  ',
            editora: '  Salamandra   ',
            quantidadeTotal: 1,
          }),
        /Já existe um livro cadastrado com este título e editora\./
      );
    });

    it('deve rejeitar duplicidade mesmo se o livro existente estiver INATIVO (RN06)', () => {
      const livro = livroController.cadastrar({
        titulo: 'Flicts',
        editora: 'Melhoramentos',
        quantidadeTotal: 2,
      });

      // Inativa o livro existente no banco
      db.prepare(`UPDATE livro SET status = 'INATIVO' WHERE id = ?`).run(livro.id);

      assert.throws(
        () =>
          livroController.cadastrar({
            titulo: 'Flicts',
            editora: 'Melhoramentos',
            quantidadeTotal: 5,
          }),
        /Já existe um livro cadastrado com este título e editora\./
      );
    });

    it('deve permitir livros com mesmo título se as editoras forem diferentes (RN06)', () => {
      const livro1 = livroController.cadastrar({
        titulo: 'O Pequeno Príncipe',
        editora: 'Agir',
        quantidadeTotal: 3,
      });

      const livro2 = livroController.cadastrar({
        titulo: 'O Pequeno Príncipe',
        editora: 'HarperCollins',
        quantidadeTotal: 2,
      });

      assert.ok(livro1.id);
      assert.ok(livro2.id);
      assert.notStrictEqual(livro1.id, livro2.id);
    });
  });

  // ========================================================
  // 3. Testes do Fluxo de Endpoint / IPC (Contrato de Resposta)
  // ========================================================
  describe('Fluxo do Endpoint (Contrato com o Frontend)', () => {
    it('deve simular sucesso do endpoint retornando { success: true, data }', () => {
      const input = {
        titulo: 'O Grúfalo',
        editora: 'Brinque-Book',
        quantidadeTotal: 8,
      };

      try {
        const data = livroController.cadastrar(input);
        const resposta = { success: true, data };

        assert.strictEqual(resposta.success, true);
        assert.ok(resposta.data.id);
        assert.strictEqual(resposta.data.titulo, 'O Grúfalo');
        assert.strictEqual(resposta.data.status, 'ATIVO');
      } catch (error) {
        assert.fail('Não deveria ter lançado erro');
      }
    });

    it('deve simular falha no endpoint por duplicidade retornando { success: false, error } sem código técnico (RNF03)', () => {
      livroController.cadastrar({
        titulo: 'Bruxa, Bruxa Venha à Minha Festa',
        editora: 'Brinque-Book',
        quantidadeTotal: 4,
      });

      let resposta: { success: boolean; data?: any; error?: string };
      try {
        const data = livroController.cadastrar({
          titulo: 'Bruxa, Bruxa Venha à Minha Festa',
          editora: 'Brinque-Book',
          quantidadeTotal: 2,
        });
        resposta = { success: true, data };
      } catch (error) {
        resposta = { success: false, error: (error as Error).message };
      }

      assert.strictEqual(resposta.success, false);
      assert.strictEqual(
        resposta.error,
        'Já existe um livro cadastrado com este título e editora. Informe um título ou editora diferente.'
      );
      assert.ok(!resposta.error?.includes('UNIQUE constraint'));
    });

    it('deve simular falha no endpoint por quantidade inválida retornando { success: false, error } (RNF03)', () => {
      let resposta: { success: boolean; data?: any; error?: string };
      try {
        const data = livroController.cadastrar({
          titulo: 'Onde Vivem os Monstros',
          editora: 'Cosac Naify',
          quantidadeTotal: -1,
        });
        resposta = { success: true, data };
      } catch (error) {
        resposta = { success: false, error: (error as Error).message };
      }

      assert.strictEqual(resposta.success, false);
      assert.strictEqual(
        resposta.error,
        'A "Quantidade Total de Cópias" deve ser um número inteiro maior que zero.'
      );
    });
  });
});
