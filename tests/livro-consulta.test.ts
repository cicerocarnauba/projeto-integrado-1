import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { LivroDAO } from '../main/daos/LivroDAO.ts';
import { LivroController } from '../main/controllers/LivroController.ts';

describe('Testes Unitários - HU04 Consultar Livro', () => {
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

    // Popula o banco com livros para teste de consulta
    const stmt = db.prepare(`
      INSERT INTO livro (titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    // Livro 1: Dom Casmurro, Saraiva, total: 10, emprestadas: 3 (saldo: 7), ATIVO
    stmt.run('Dom Casmurro', 'Saraiva', 10, 3, 'ATIVO', now, now);
    // Livro 2: Memórias Póstumas de Brás Cubas, Ática, total: 5, emprestadas: 0 (saldo: 5), ATIVO
    stmt.run('Memórias Póstumas de Brás Cubas', 'Ática', 5, 0, 'ATIVO', now, now);
    // Livro 3: O Alienista, Saraiva, total: 4, emprestadas: 4 (saldo: 0), ATIVO
    stmt.run('O Alienista', 'Saraiva', 4, 4, 'ATIVO', now, now);
    // Livro 4: Quincas Borba, Saraiva, total: 8, emprestadas: 2 (saldo: 6), INATIVO
    stmt.run('Quincas Borba', 'Saraiva', 8, 2, 'INATIVO', now, now);
    // Livro 5: A Moreninha, Ática, total: 6, emprestadas: 1 (saldo: 5), ATIVO
    stmt.run('A Moreninha', 'Ática', 6, 1, 'ATIVO', now, now);
  });

  // ========================================================
  // 1. Regras de Negócio e Filtros de Consulta (RF04, RNF04)
  // ========================================================
  describe('Regras de Negócio e Filtros de Consulta', () => {
    it('deve listar apenas livros ativos por padrão quando nenhum filtro for informado', () => {
      const resultado = livroController.consultar();

      // De 5 livros cadastrados, 4 são ATIVOS e 1 é INATIVO
      assert.strictEqual(resultado.length, 4);
      assert.ok(resultado.every((l) => l.status === 'ATIVO'));
    });

    it('deve ordenar os resultados em ordem alfabética por título e editora', () => {
      const resultado = livroController.consultar();

      // Ordem esperada dos ativos:
      // 1. A Moreninha (Ática)
      // 2. Dom Casmurro (Saraiva)
      // 3. Memórias Póstumas de Brás Cubas (Ática)
      // 4. O Alienista (Saraiva)
      assert.strictEqual(resultado[0].titulo, 'A Moreninha');
      assert.strictEqual(resultado[1].titulo, 'Dom Casmurro');
      assert.strictEqual(resultado[2].titulo, 'Memórias Póstumas de Brás Cubas');
      assert.strictEqual(resultado[3].titulo, 'O Alienista');
    });

    it('deve filtrar livros por título de forma parcial (substring)', () => {
      const resultado = livroController.consultar({ titulo: 'Casmurro' });

      assert.strictEqual(resultado.length, 1);
      assert.strictEqual(resultado[0].titulo, 'Dom Casmurro');
    });

    it('deve filtrar livros por título ignorando maiúsculas e minúsculas (RNF04)', () => {
      const resultado = livroController.consultar({ titulo: 'dom casmurro' });

      assert.strictEqual(resultado.length, 1);
      assert.strictEqual(resultado[0].titulo, 'Dom Casmurro');
    });

    it('deve filtrar livros por título ignorando espaços extras nas extremidades (RNF04)', () => {
      const resultado = livroController.consultar({ titulo: '   Alienista   ' });

      assert.strictEqual(resultado.length, 1);
      assert.strictEqual(resultado[0].titulo, 'O Alienista');
    });

    it('deve filtrar livros por editora de forma parcial e case-insensitive', () => {
      const resultado = livroController.consultar({ editora: 'ática' });

      assert.strictEqual(resultado.length, 2);
      assert.ok(resultado.every((l) => l.editora === 'Ática'));
    });

    it('deve combinar filtros de título e editora com operador AND', () => {
      // Existe Dom Casmurro na Saraiva, mas não na Ática
      const resultadoSaraiva = livroController.consultar({ titulo: 'Casmurro', editora: 'Saraiva' });
      assert.strictEqual(resultadoSaraiva.length, 1);

      const resultadoAtica = livroController.consultar({ titulo: 'Casmurro', editora: 'Ática' });
      assert.strictEqual(resultadoAtica.length, 0);
    });

    it('deve filtrar por termo geral pesquisando tanto em título quanto em editora', () => {
      const resultado = livroController.consultar({ termo: 'Saraiva' });

      // Deve encontrar todos os livros ATIVOS da editora Saraiva (Dom Casmurro e O Alienista)
      assert.strictEqual(resultado.length, 2);
      assert.ok(resultado.every((l) => l.editora === 'Saraiva'));
    });
  });

  // ========================================================
  // 2. Flag para Livros "Inativos" (RN04)
  // ========================================================
  describe('Flag para Livros "Inativos"', () => {
    it('não deve trazer livros inativos quando incluirInativos for false ou omitido', () => {
      const resultadoSemParam = livroController.consultar();
      assert.strictEqual(resultadoSemParam.some((l) => l.titulo === 'Quincas Borba'), false);

      const resultadoFalse = livroController.consultar({ incluirInativos: false });
      assert.strictEqual(resultadoFalse.some((l) => l.titulo === 'Quincas Borba'), false);
    });

    it('deve incluir livros inativos quando incluirInativos for true', () => {
      const resultado = livroController.consultar({ incluirInativos: true });

      // Total de 5 livros (4 ATIVOS + 1 INATIVO)
      assert.strictEqual(resultado.length, 5);
      const quincas = resultado.find((l) => l.titulo === 'Quincas Borba');
      assert.ok(quincas);
      assert.strictEqual(quincas?.status, 'INATIVO');
    });

    it('deve ordenar colocando livros ATIVOS antes dos INATIVOS', () => {
      const resultado = livroController.consultar({ incluirInativos: true });

      // O último livro deve ser o inativo (Quincas Borba)
      const ultimo = resultado[resultado.length - 1];
      assert.strictEqual(ultimo.status, 'INATIVO');
      assert.strictEqual(ultimo.titulo, 'Quincas Borba');

      // Os primeiros devem ser todos ATIVOS
      const anteriores = resultado.slice(0, 4);
      assert.ok(anteriores.every((l) => l.status === 'ATIVO'));
    });
  });

  // ========================================================
  // 3. Lógica do Cálculo do Saldo de Livros (RN03)
  // ========================================================
  describe('Lógica do Cálculo do Saldo de Livros', () => {
    it('deve calcular corretamente o saldoDisponivel como quantidadeTotal - quantidadeEmprestada', () => {
      const resultado = livroController.consultar({ titulo: 'Dom Casmurro' });
      const livro = resultado[0];

      // Total: 10, Emprestadas: 3 => Saldo: 7
      assert.strictEqual(livro.quantidadeTotal, 10);
      assert.strictEqual(livro.quantidadeEmprestada, 3);
      assert.strictEqual(livro.saldoDisponivel, 7);
    });

    it('deve exibir saldoDisponivel igual à quantidadeTotal quando não houver empréstimos', () => {
      const resultado = livroController.consultar({ titulo: 'Memórias Póstumas' });
      const livro = resultado[0];

      // Total: 5, Emprestadas: 0 => Saldo: 5
      assert.strictEqual(livro.quantidadeTotal, 5);
      assert.strictEqual(livro.quantidadeEmprestada, 0);
      assert.strictEqual(livro.saldoDisponivel, 5);
    });

    it('deve exibir saldoDisponivel igual a 0 quando todas as cópias estiverem emprestadas', () => {
      const resultado = livroController.consultar({ titulo: 'O Alienista' });
      const livro = resultado[0];

      // Total: 4, Emprestadas: 4 => Saldo: 0
      assert.strictEqual(livro.quantidadeTotal, 4);
      assert.strictEqual(livro.quantidadeEmprestada, 4);
      assert.strictEqual(livro.saldoDisponivel, 0);
    });
  });

  // ========================================================
  // 4. Teste do Endpoint GET /livros (Canal IPC livro:consultar)
  // ========================================================
  describe('Teste do Endpoint GET /livros (Canal IPC livro:consultar)', () => {
    it('deve responder com formato { success: true, data: [...] } contendo lista de livros e saldos', async () => {
      // Simulação da chamada do handler IPC
      const handleConsulta = async (input?: { titulo?: string; editora?: string; incluirInativos?: boolean }) => {
        try {
          const filtro = input ?? {};
          const livros = livroController.consultar(filtro);
          return { success: true, data: livros };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleConsulta({ editora: 'Saraiva' });

      assert.strictEqual(response.success, true);
      assert.ok(Array.isArray(response.data));
      assert.strictEqual(response.data.length, 2);

      const primeiro = response.data[0];
      assert.ok('id' in primeiro);
      assert.ok('titulo' in primeiro);
      assert.ok('editora' in primeiro);
      assert.ok('quantidadeTotal' in primeiro);
      assert.ok('quantidadeEmprestada' in primeiro);
      assert.ok('saldoDisponivel' in primeiro);
      assert.ok('status' in primeiro);
    });

    it('deve retornar lista vazia { success: true, data: [] } quando nenhum livro for encontrado', async () => {
      const handleConsulta = async (input?: { titulo?: string }) => {
        try {
          const livros = livroController.consultar(input);
          return { success: true, data: livros };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleConsulta({ titulo: 'Título Inexistente No Acervo' });

      assert.strictEqual(response.success, true);
      assert.deepStrictEqual(response.data, []);
    });

    it('deve suportar busca com incluirInativos através do endpoint', async () => {
      const handleConsulta = async (input?: { incluirInativos?: boolean }) => {
        try {
          const livros = livroController.consultar(input);
          return { success: true, data: livros };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleConsulta({ incluirInativos: true });

      assert.strictEqual(response.success, true);
      assert.strictEqual(response.data.length, 5);
      assert.ok(response.data.some((l) => l.status === 'INATIVO'));
    });
  });
});
