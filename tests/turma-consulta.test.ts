import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import { TurmaDAO } from '../main/daos/TurmaDAO.ts';
import { TurmaController } from '../main/controllers/TurmaController.ts';

describe('Testes Unitários - HU13 Consultar Turma', () => {
  let db: Database.Database;
  let turmaDAO: TurmaDAO;
  let turmaController: TurmaController;

  beforeEach(() => {
    // Banco SQLite isolado em memória
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

    // Popula o banco com turmas ativas e inativas para os testes
    const stmt = db.prepare(`
      INSERT INTO turma (nome, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    // Turmas ativas (em ordem não-alfabética para testar ordenação)
    stmt.run('5º Ano B', 'ATIVO', now, now);
    stmt.run('1º Ano A', 'ATIVO', now, now);
    stmt.run('3º Ano - Manhã', 'ATIVO', now, now);
    stmt.run('Berçário', 'ATIVO', now, now);

    // Turmas inativas
    stmt.run('4º Ano C (2023)', 'INATIVO', now, now);
    stmt.run('2º Ano B (2024)', 'INATIVO', now, now);
  });

  // ========================================================
  // 1. Regra da Seleção de Turmas (Conversa e Confirmação)
  // ========================================================
  describe('Regra da Seleção de Turmas (Conversa e Confirmação da HU13)', () => {
    it('deve, por padrão, mostrar primeiro as turmas com status "Ativa" e depois as turmas com status "Inativa"', () => {
      // Conversa: Por padrão, a seleção mostra primeiro as turmas com status "Ativa" e depois as turmas com status "Inativa".
      // Confirmação: Dado as turmas cadastradas, quando a bibliotecária abre a seleção de turma, então vê primeiro as turmas com status "Ativa".
      const turmas = turmaController.consultar({});

      assert.strictEqual(turmas.length, 6);

      // As primeiras 4 devem ser ATIVO
      const primeiras = turmas.slice(0, 4);
      assert.ok(primeiras.every((t) => t.status === 'ATIVO'));

      // As últimas 2 devem ser INATIVO
      const ultimas = turmas.slice(4);
      assert.ok(ultimas.every((t) => t.status === 'INATIVO'));
    });

    it('deve ordenar alfabeticamente por nome dentro do grupo de ativas e dentro do grupo de inativas', () => {
      const turmas = turmaController.consultar({});

      // Ordem alfabética esperada das ATIVAS:
      // 1. 1º Ano A
      // 2. 3º Ano - Manhã
      // 3. 5º Ano B
      // 4. Berçário
      assert.strictEqual(turmas[0].nome, '1º Ano A');
      assert.strictEqual(turmas[1].nome, '3º Ano - Manhã');
      assert.strictEqual(turmas[2].nome, '5º Ano B');
      assert.strictEqual(turmas[3].nome, 'Berçário');

      // Ordem alfabética esperada das INATIVAS:
      // 5. 2º Ano B (2024)
      // 6. 4º Ano C (2023)
      assert.strictEqual(turmas[4].nome, '2º Ano B (2024)');
      assert.strictEqual(turmas[5].nome, '4º Ano C (2023)');
    });
  });

  // ========================================================
  // 2. Filtro por Nome (RF13, RNF04)
  // ========================================================
  describe('Filtros de Pesquisa por Nome (RF13, RNF04)', () => {
    it('deve filtrar turmas por nome de forma parcial (substring)', () => {
      const turmas = turmaController.consultar({ nome: 'Ano B' });

      // Deve encontrar '5º Ano B' (ativo) e '2º Ano B (2024)' (inativo)
      assert.strictEqual(turmas.length, 2);
      assert.strictEqual(turmas[0].nome, '5º Ano B');
      assert.strictEqual(turmas[1].nome, '2º Ano B (2024)');
    });

    it('deve filtrar ignorando maiúsculas e minúsculas (RNF04)', () => {
      const turmas = turmaController.consultar({ nome: 'berçário' });

      assert.strictEqual(turmas.length, 1);
      assert.strictEqual(turmas[0].nome, 'Berçário');
    });

    it('deve filtrar ignorando espaços extras nas extremidades (RNF04)', () => {
      const turmas = turmaController.consultar({ nome: '   1º Ano A   ' });

      assert.strictEqual(turmas.length, 1);
      assert.strictEqual(turmas[0].nome, '1º Ano A');
    });

    it('deve tratar acentos corretamente na busca case-insensitive (RNF04)', () => {
      // 'MANHÃ' em caixa alta deve encontrar '3º Ano - Manhã'
      const turmas = turmaController.consultar({ nome: 'MANHÃ' });

      assert.strictEqual(turmas.length, 1);
      assert.strictEqual(turmas[0].nome, '3º Ano - Manhã');
    });
  });

  // ========================================================
  // 3. Controle de Exibição de Inativos
  // ========================================================
  describe('Controle de Exibição de Inativos', () => {
    it('deve retornar apenas turmas ativas quando incluirInativos for explicitamente false', () => {
      const turmas = turmaController.consultar({ incluirInativos: false });

      assert.strictEqual(turmas.length, 4);
      assert.ok(turmas.every((t) => t.status === 'ATIVO'));
      assert.strictEqual(turmas.some((t) => t.status === 'INATIVO'), false);
    });

    it('deve manter ordem "Ativas primeiro, depois Inativas" quando incluirInativos for true', () => {
      const turmas = turmaController.consultar({ incluirInativos: true });

      assert.strictEqual(turmas.length, 6);
      assert.strictEqual(turmas[0].status, 'ATIVO');
      assert.strictEqual(turmas[turmas.length - 1].status, 'INATIVO');
    });
  });

  // ========================================================
  // 4. Testes do Endpoint GET /turmas (Canal IPC turma:consultar)
  // ========================================================
  describe('Testes do Endpoint GET /turmas (Canal IPC turma:consultar)', () => {
    it('deve responder com formato { success: true, data: [...] } contendo a lista de turmas', async () => {
      const handleConsultar = async (input?: { nome?: string; incluirInativos?: boolean }) => {
        try {
          const filtro = input ?? {};
          const turmas = turmaController.consultar({
            nome: typeof filtro.nome === 'string' ? filtro.nome : undefined,
            incluirInativos:
              typeof filtro.incluirInativos === 'boolean' ? filtro.incluirInativos : undefined,
          });
          return { success: true, data: turmas };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleConsultar();

      assert.strictEqual(response.success, true);
      assert.ok(Array.isArray(response.data));
      assert.strictEqual(response.data.length, 6);

      const primeira = response.data[0];
      assert.ok('id' in primeira);
      assert.ok('nome' in primeira);
      assert.ok('status' in primeira);
      assert.ok('dataCadastro' in primeira);
      assert.ok('dataAtualizacao' in primeira);
      assert.strictEqual(primeira.status, 'ATIVO');
    });

    it('deve retornar lista vazia { success: true, data: [] } quando nenhuma turma coincidir com o filtro', async () => {
      const handleConsultar = async (input?: { nome?: string }) => {
        try {
          const turmas = turmaController.consultar(input ?? {});
          return { success: true, data: turmas };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleConsultar({ nome: 'Turma Inexistente' });

      assert.strictEqual(response.success, true);
      assert.deepStrictEqual(response.data, []);
    });

    it('deve filtrar turmas ativas quando o endpoint receber incluirInativos = false', async () => {
      const handleConsultar = async (input?: { incluirInativos?: boolean }) => {
        try {
          const turmas = turmaController.consultar({
            incluirInativos:
              typeof input?.incluirInativos === 'boolean' ? input.incluirInativos : undefined,
          });
          return { success: true, data: turmas };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      };

      const response = await handleConsultar({ incluirInativos: false });

      assert.strictEqual(response.success, true);
      assert.strictEqual(response.data.length, 4);
      assert.ok(response.data.every((t) => t.status === 'ATIVO'));
    });
  });
});
