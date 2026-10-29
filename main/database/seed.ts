import Database from 'better-sqlite3';

/**
 * Script de inicialização automática de dados de teste (Seed).
 * Popula o banco caso ele esteja vazio, garantindo que qualquer desenvolvedor
 * ou avaliador que execute `npm run dev` já tenha o ambiente pronto para testes
 * com exatamente 2 registros de cada cenário (Excluir, Desativar, Bloqueio de Desativação, Ativar).
 */
export function executarSeedSeVazio(db: Database.Database): void {
  try {
    if (process.env.NO_SEED === 'true') {
      return;
    }

    const totalProfessores = db.prepare('SELECT count(*) as c FROM professor').get() as { c: number };
    if (totalProfessores && totalProfessores.c > 0) {
      // Banco já possui dados, não sobrescreve
      return;
    }

    console.log('[Seed] Banco de dados vazio detectado. Inserindo dados iniciais de demonstração...');

    db.exec(`
      BEGIN TRANSACTION;

      -- ====================================================================
      -- 1. PROFESSORES (12 registros)
      -- ====================================================================
      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (1, 'Ana', 'Silva', 'ana.silva@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (2, 'Carlos', 'Eduardo', 'carlos.eduardo@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (3, 'Juliana', 'Ferreira', 'juliana.ferreira@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (4, 'Lucas', 'Rodrigues', 'lucas.rodrigues@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (5, 'Roberto', 'Oliveira', 'roberto.oliveira@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (6, 'Patrícia', 'Costa', 'patricia.costa@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (7, 'Mateus', 'Pacheco', 'mateus.pacheco@escola.com.br', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (8, 'Clara', 'Vargas', 'clara.vargas@escola.com.br', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (9, 'Mariana', 'Souza', 'mariana.souza@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (10, 'Gabriel', 'Mendes', 'gabriel.mendes@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (11, 'Beatriz', 'Lima', 'beatriz.lima@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (12, 'Fernando', 'Dias', 'fernando.dias@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      -- ====================================================================
      -- 2. TURMAS (12 registros)
      -- ====================================================================
      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (1, 'Maternal I A', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (2, 'Maternal I B', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (3, 'Maternal II A', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (4, 'Pré I A', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (5, 'Maternal I - Tempo Integral', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (6, 'Pré I - Vespertino', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (7, 'Pré I B', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (8, 'Pré II B', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (9, 'Berçário I', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (10, 'Berçário II', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (11, 'Maternal II B', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO turma (id, nome, status, data_cadastro, data_atualizacao)
      VALUES (12, 'Pré II A', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      -- ====================================================================
      -- 3. LIVROS (14 registros)
      -- ====================================================================
      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (1, 'A Bolsa Amarela', 'José Olympio', 8, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (2, 'A Casa Sonolenta', 'Ática', 10, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (3, 'Reinações de Narizinho', 'Globo Livros', 6, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (4, 'Flicts', 'Melhoramentos', 5, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (5, 'O Menino Maluquinho', 'Melhoramentos', 10, 5, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (6, 'O Pequeno Príncipe', 'Agir', 12, 6, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (7, 'Menino Poti', 'Moderna', 0, 0, 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (8, 'Histórias da Cazumbinha', 'Companhia das Letrinhas', 0, 0, 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (9, 'Chapeuzinho Amarelo', 'José Olympio', 15, 3, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (10, 'Ou Isto ou Aquilo', 'Global Editora', 8, 2, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (11, 'A Arca de Noé', 'Companhia das Letrinhas', 5, 5, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (12, 'Marcelo, Marmelo, Martelo', 'Salamandra', 12, 4, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (13, 'O Pote Vazio', 'Martins Fontes', 7, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (14, 'O Grúfalo', 'Brinque-Book', 10, 3, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      -- ====================================================================
      -- 4. EMPRÉSTIMOS E ITENS (16 empréstimos, 18 itens)
      -- ====================================================================
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (1, 3, 3, '2026-09-10T14:00:00.000Z', '2026-09-18T10:00:00.000Z', 'CONCLUIDO');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (2, 4, 4, '2026-09-12T09:30:00.000Z', '2026-09-20T11:00:00.000Z', 'CONCLUIDO');

      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (3, 5, 5, '2026-10-01T10:00:00.000Z', NULL, 'PENDENTE');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (4, 6, 6, '2026-10-02T13:30:00.000Z', NULL, 'PENDENTE');

      -- Devolução Parcial (ID 5)
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (5, 9, 9, '2026-10-05T08:30:00.000Z', NULL, 'PENDENTE');

      -- Multi-itens (ID 6)
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (6, 11, 11, '2026-10-08T11:00:00.000Z', NULL, 'PENDENTE');

      -- Itens Mistos (ID 7)
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (7, 12, 12, '2026-10-10T14:00:00.000Z', NULL, 'PENDENTE');

      -- Avaria Registrada (ID 8)
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (8, 5, 5, '2026-10-14T09:00:00.000Z', NULL, 'PENDENTE');

      -- Paginação e Busca (IDs 9 a 14)
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (9, 6, 6, '2026-10-16T15:00:00.000Z', NULL, 'PENDENTE');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (10, 9, 9, '2026-10-18T10:30:00.000Z', NULL, 'PENDENTE');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (11, 11, 11, '2026-10-20T13:45:00.000Z', NULL, 'PENDENTE');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (12, 12, 12, '2026-10-22T08:15:00.000Z', NULL, 'PENDENTE');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (13, 3, 3, '2026-10-25T16:20:00.000Z', NULL, 'PENDENTE');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (14, 4, 4, '2026-10-28T09:00:00.000Z', NULL, 'PENDENTE');

      -- Histórico (IDs 15 e 16)
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (15, 10, 10, '2026-09-25T10:00:00.000Z', NULL, 'CANCELADO');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
      VALUES (16, 9, 9, '2026-09-28T14:30:00.000Z', '2026-10-04T11:00:00.000Z', 'CONCLUIDO');

      -- Itens
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (1, 1, 3, 2, 2, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (2, 2, 4, 1, 1, 0, 0);

      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (3, 3, 5, 3, 0, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (4, 4, 6, 4, 0, 0, 0);

      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (5, 5, 10, 4, 2, 0, 0);

      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (6, 6, 12, 2, 0, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (7, 6, 14, 2, 0, 0, 0);

      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (8, 7, 12, 2, 2, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (9, 7, 5, 1, 0, 0, 0);

      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (10, 8, 6, 3, 0, 0, 1);

      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (11, 9, 5, 1, 0, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (12, 10, 11, 5, 0, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (13, 11, 12, 2, 0, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (14, 12, 14, 1, 0, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (15, 13, 9, 1, 0, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (16, 14, 9, 2, 0, 0, 0);

      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (17, 15, 13, 2, 0, 0, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (18, 16, 13, 2, 1, 1, 0);

      COMMIT;
    `);

    console.log('[Seed] Banco de dados populado com sucesso com 2 registros de cada cenário de teste!');
  } catch (error) {
    console.error('[Seed] Erro ao executar seed automático:', error);
  }
}
