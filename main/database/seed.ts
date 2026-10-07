import Database from 'better-sqlite3';

/**
 * Script de inicialização automática de dados de teste (Seed).
 * Popula o banco caso ele esteja vazio, garantindo que qualquer desenvolvedor
 * ou avaliador que execute `npm run dev` já tenha o ambiente pronto para testes
 * com exatamente 2 registros de cada cenário (Excluir, Desativar, Bloqueio de Desativação, Ativar).
 */
export function executarSeedSeVazio(db: Database.Database): void {
  try {
    const totalProfessores = db.prepare('SELECT count(*) as c FROM professor').get() as { c: number };
    if (totalProfessores && totalProfessores.c > 0) {
      // Banco já possui dados, não sobrescreve
      return;
    }

    console.log('[Seed] Banco de dados vazio detectado. Inserindo dados iniciais de demonstração...');

    db.exec(`
      BEGIN TRANSACTION;

      -- ====================================================================
      -- 1. PROFESSORES (8 registros: 2 excluir, 2 desativar sucesso, 2 desativar erro, 2 ativar)
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

      -- ====================================================================
      -- 2. TURMAS (8 registros: 2 excluir, 2 desativar sucesso, 2 desativar erro, 2 ativar)
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

      -- ====================================================================
      -- 3. LIVROS (8 registros: 2 excluir, 2 desativar sucesso, 2 desativar erro, 2 ativar)
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
      VALUES (5, 'O Menino Maluquinho', 'Melhoramentos', 10, 3, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (6, 'O Pequeno Príncipe', 'Agir', 12, 4, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (7, 'Menino Poti', 'Moderna', 0, 0, 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
      INSERT OR IGNORE INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (8, 'Histórias da Cazumbinha', 'Companhia das Letrinhas', 0, 0, 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

      -- ====================================================================
      -- 4. EMPRÉSTIMOS E ITENS
      -- ====================================================================
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, status)
      VALUES (1, 3, 3, '2026-09-10T14:00:00.000Z', 'CONCLUIDO');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, status)
      VALUES (2, 4, 4, '2026-09-12T09:30:00.000Z', 'CONCLUIDO');

      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, status)
      VALUES (3, 5, 5, '2026-10-01T10:00:00.000Z', 'PENDENTE');
      INSERT OR IGNORE INTO emprestimo (id, professor_id, turma_id, data_retirada, status)
      VALUES (4, 6, 6, '2026-10-02T13:30:00.000Z', 'PENDENTE');

      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida)
      VALUES (1, 1, 3, 2, 2);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida)
      VALUES (2, 2, 4, 1, 1);

      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida)
      VALUES (3, 3, 5, 3, 0);
      INSERT OR IGNORE INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida)
      VALUES (4, 4, 6, 4, 0);

      COMMIT;
    `);

    console.log('[Seed] Banco de dados populado com sucesso com 2 registros de cada cenário de teste!');
  } catch (error) {
    console.error('[Seed] Erro ao executar seed automático:', error);
  }
}
