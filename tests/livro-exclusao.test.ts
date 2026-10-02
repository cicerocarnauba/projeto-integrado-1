import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import { LivroController } from '../main/controllers/LivroController.ts';

describe('Testes Unitários - HU03 Excluir Livro', () => {
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

      -- Tabela opcional de itens de empréstimo para simular histórico concluído
      CREATE TABLE IF NOT EXISTS item_emprestimo (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        emprestimo_id  INTEGER NOT NULL,
        livro_id       INTEGER NOT NULL,
        quantidade     INTEGER NOT NULL,
        status         TEXT NOT NULL DEFAULT 'DEVOLVIDO'
      );
    `);

    livroDAO = new LivroDAO(db);
    livroController = new LivroController(livroDAO);

    const stmt = db.prepare(`
      INSERT INTO livro (titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    // Livro 1: Ativo, 5 cópias, 0 emprestadas, SEM histórico de empréstimos (id: 1)
    stmt.run('Chapeuzinho Vermelho', 'Ática', 5, 0, 'ATIVO', now, now);

    // Livro 2: Ativo, 10 cópias, 2 emprestadas no momento (COM histórico ativo) (id: 2)
    stmt.run('O Menino Maluquinho', 'Melhoramentos', 10, 2, 'ATIVO', now, now);

    // Livro 3: Ativo, 8 cópias, 0 emprestadas atualmente, mas COM histórico passado em item_emprestimo (id: 3)
    stmt.run('Reinações de Narizinho', 'Globo', 8, 0, 'ATIVO', now, now);
    db.prepare(`
      INSERT INTO item_emprestimo (emprestimo_id, livro_id, quantidade, status)
      VALUES (101, 3, 1, 'DEVOLVIDO')
    `).run();

    // Livro 4: Inativo, 3 cópias, 0 emprestadas, SEM histórico (id: 4)
    stmt.run('Fábulas de Esopo', 'Scipione', 3, 0, 'INATIVO', now, now);

    // Livro 5: Inativo, 4 cópias, 0 emprestadas atualmente, mas COM histórico passado (id: 5)
    stmt.run('Dom Quixote Infantil', 'Moderna', 4, 0, 'INATIVO', now, now);
    db.prepare(`
      INSERT INTO item_emprestimo (emprestimo_id, livro_id, quantidade, status)
      VALUES (102, 5, 2, 'DEVOLVIDO')
    `).run();
  });

  // =========================================================================
  // 1. Regra de Decisão: Sem Histórico de Empréstimos -> Exclusão Física (DELETE)
  // =========================================================================
  describe('Cenário 1: Sem Histórico de Empréstimos (Exclusão Física Definitiva)', () => {
    it('deve excluir fisicamente do banco de dados o livro ativo sem histórico', () => {
      // Livro 1 não possui nenhum empréstimo no histórico
      const resultado = livroController.excluir(1);

      assert.strictEqual(resultado.acao, 'EXCLUIDO');
      assert.strictEqual(resultado.id, 1);
      assert.strictEqual(resultado.mensagem, 'Livro excluído com sucesso do acervo.');

      // Confirma que o registro foi removido fisicamente do SQLite
      const livroNoBanco = livroDAO.buscarPorId(1);
      assert.strictEqual(livroNoBanco, null);

      const row = db.prepare('SELECT * FROM livro WHERE id = 1').get();
      assert.strictEqual(row, undefined);
    });

    it('deve excluir fisicamente do banco de dados o livro inativo sem histórico', () => {
      // Livro 4 é inativo e nunca teve empréstimos; a RN04 exige exclusão definitiva
      const resultado = livroController.excluir(4);

      assert.strictEqual(resultado.acao, 'EXCLUIDO');
      assert.strictEqual(resultado.id, 4);

      const livroNoBanco = livroDAO.buscarPorId(4);
      assert.strictEqual(livroNoBanco, null);
    });

    it('deve permitir cadastrar novamente o mesmo título e editora após exclusão física', () => {
      // Exclui livro 1 ('Chapeuzinho Vermelho', 'Ática')
      livroController.excluir(1);

      // Como foi excluído fisicamente, o cadastro deve ser permitido novamente sem violar unicidade (RN06)
      const novoLivro = livroController.cadastrar({
        titulo: 'Chapeuzinho Vermelho',
        editora: 'Ática',
        quantidadeTotal: 7,
      });

      assert.ok(novoLivro.id);
      assert.strictEqual(novoLivro.titulo, 'Chapeuzinho Vermelho');
      assert.strictEqual(novoLivro.quantidadeTotal, 7);
    });
  });

  // =========================================================================
  // 2. Regra de Decisão: Com Histórico de Empréstimos -> Desativação Lógica (RN04)
  // =========================================================================
  describe('Cenário 2: Com Histórico de Empréstimos (Desativação Lógica)', () => {
    it('deve realizar desativação lógica (status INATIVO) quando livro possui cópias emprestadas atualmente', () => {
      // Livro 2 tem 2 exemplares emprestados no momento
      const resultado = livroController.excluir(2);

      assert.strictEqual(resultado.acao, 'DESATIVADO');
      assert.strictEqual(resultado.id, 2);
      assert.ok(resultado.mensagem.includes('desativado'));
      assert.strictEqual(resultado.livro?.status, 'INATIVO');

      // Confirma que o registro NÃO foi apagado do banco de dados
      const livroNoBanco = livroDAO.buscarPorId(2);
      assert.ok(livroNoBanco !== null);
      assert.strictEqual(livroNoBanco?.id, 2);
      assert.strictEqual(livroNoBanco?.status, 'INATIVO');
      assert.strictEqual(livroNoBanco?.titulo, 'O Menino Maluquinho');
    });

    it('deve realizar desativação lógica quando livro possui histórico passado mesmo com saldo todo devolvido', () => {
      // Livro 3 tem quantidade_emprestada = 0, mas consta na tabela item_emprestimo
      const resultado = livroController.excluir(3);

      assert.strictEqual(resultado.acao, 'DESATIVADO');
      assert.strictEqual(resultado.id, 3);
      assert.strictEqual(resultado.livro?.status, 'INATIVO');

      // Confirma preservação da rastreabilidade no SQLite
      const livroNoBanco = livroDAO.buscarPorId(3);
      assert.ok(livroNoBanco !== null);
      assert.strictEqual(livroNoBanco?.status, 'INATIVO');
      assert.strictEqual(livroNoBanco?.titulo, 'Reinações de Narizinho');
    });

    it('deve manter livro inativo no banco sem exclusão física quando solicitado excluir livro inativo com histórico', () => {
      // Livro 5 já está inativo e possui histórico de empréstimos
      const resultado = livroController.excluir(5);

      assert.strictEqual(resultado.acao, 'DESATIVADO');
      assert.strictEqual(resultado.id, 5);

      const livroNoBanco = livroDAO.buscarPorId(5);
      assert.ok(livroNoBanco !== null);
      assert.strictEqual(livroNoBanco?.status, 'INATIVO');
    });

    it('livro desativado não deve aparecer na consulta padrão, mas deve constar com incluirInativos: true (RF04)', () => {
      // Desativa livro 2 através da solicitação de exclusão
      livroController.excluir(2);

      // Consulta padrão (apenas ativos)
      const ativos = livroController.consultar();
      const encontrouAtivos = ativos.some((l) => l.id === 2);
      assert.strictEqual(encontrouAtivos, false);

      // Consulta incluindo inativos
      const todos = livroController.consultar({ incluirInativos: true });
      const livroInativo = todos.find((l) => l.id === 2);
      assert.ok(livroInativo !== undefined);
      assert.strictEqual(livroInativo?.status, 'INATIVO');
    });
  });

  // =========================================================================
  // 3. Validações e Tratamento de Erros (RNF03)
  // =========================================================================
  describe('Cenário 3: Validações e Tratamento de Exceções', () => {
    it('deve rejeitar exclusão caso o ID informado não exista no acervo', () => {
      assert.throws(
        () => {
          livroController.excluir(9999);
        },
        {
          name: 'Error',
          message: 'Livro não encontrado no acervo.',
        }
      );
    });

    it('deve rejeitar exclusão com ID inválido (não inteiro ou menor/igual a zero)', () => {
      assert.throws(
        () => {
          livroController.excluir(0);
        },
        {
          name: 'Error',
          message: 'ID do livro inválido para exclusão.',
        }
      );

      assert.throws(
        () => {
          livroController.excluir(-5);
        },
        {
          name: 'Error',
          message: 'ID do livro inválido para exclusão.',
        }
      );

      assert.throws(
        () => {
          livroController.excluir(3.14 as any);
        },
        {
          name: 'Error',
          message: 'ID do livro inválido para exclusão.',
        }
      );
    });
  });

  // =========================================================================
  // 4. Testes do Endpoint DELETE /livros/{id} (Canal IPC livro:excluir)
  // =========================================================================
  describe('Cenário 4: Teste do Endpoint DELETE /livros/{id} (Canal IPC livro:excluir)', () => {
    const handleExcluir = async (id: any) => {
      try {
        const resultado = livroController.excluir(Number(id));
        return { success: true, data: resultado };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    };

    it('deve responder com { success: true, data: { acao: "EXCLUIDO" } } para livro sem histórico', async () => {
      const response = await handleExcluir(1);

      assert.strictEqual(response.success, true);
      assert.ok(response.data);
      assert.strictEqual(response.data.acao, 'EXCLUIDO');
      assert.strictEqual(response.data.id, 1);
      assert.strictEqual(response.data.mensagem, 'Livro excluído com sucesso do acervo.');
    });

    it('deve responder com { success: true, data: { acao: "DESATIVADO" } } para livro com histórico', async () => {
      const response = await handleExcluir(2);

      assert.strictEqual(response.success, true);
      assert.ok(response.data);
      assert.strictEqual(response.data.acao, 'DESATIVADO');
      assert.strictEqual(response.data.id, 2);
      assert.strictEqual(response.data.livro?.status, 'INATIVO');
    });

    it('deve responder com { success: false, error } amigável quando livro não for encontrado', async () => {
      const response = await handleExcluir(8888);

      assert.strictEqual(response.success, false);
      assert.strictEqual(response.error, 'Livro não encontrado no acervo.');
    });

    it('deve responder com { success: false, error } para id inválido', async () => {
      const response = await handleExcluir('abc');

      assert.strictEqual(response.success, false);
      assert.strictEqual(response.error, 'ID do livro inválido para exclusão.');
    });
  });
});
