-- ====================================================================
-- Script de Carga Inicial de Dados de Demonstração (Seed)
-- Sistema de Gerenciamento de Acervo de Biblioteca Escolar
--
-- Cenários cobertos:
-- 1. [Professor / Turma / Livro]:
--    - Sem histórico (permite exclusão física)
--    - Com histórico concluído (permite desativação com sucesso)
--    - Com empréstimo pendente (bloqueia desativação)
--    - Inativo (permite reativação; bloqueia realização de empréstimo)
--
-- 2. [Realizar Empréstimo]:
--    - Livros com amplo saldo disponível (ex: Chapeuzinho Amarelo - saldo 12)
--    - Livro com estoque 100% esgotado (A Arca de Noé - saldo 0 para validar bloqueio)
--    - Professores, turmas e livros inativos para validar rejeição
--
-- 3. [Cancelar Empréstimo]:
--    - Pendente simples (pode cancelar e repõe estoque)
--    - Pendente múltiplos livros (pode cancelar e repõe estoque de todos)
--    - Pendente com DEVOLUÇÃO PARCIAL (bloqueia cancelamento com erro amigável)
--    - Pendente com AVARIA registrada (bloqueia cancelamento com erro amigável)
--
-- 4. [Consultar Empréstimo / Detalhes / Paginação / Busca]:
--    - Aba Pendentes: 12 empréstimos (ativa paginação com > 10 itens)
--    - Aba Concluídos e Cancelados: 4 empréstimos (concluídos normais, com avaria e cancelados)
--    - Itens mistos: um livro devolvido (concluído) e outro pendente no mesmo empréstimo
--    - Badges de avaria: perda e dano
-- ====================================================================

-- 1. ESTRUTURA DAS TABELAS
CREATE TABLE IF NOT EXISTS professor (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  primeiro_nome   TEXT NOT NULL,
  sobrenome       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'ATIVO'
                  CHECK (status IN ('ATIVO', 'INATIVO')),
  data_cadastro   TEXT NOT NULL,
  data_atualizacao TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS emprestimo (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  professor_id    INTEGER NOT NULL,
  turma_id        INTEGER NOT NULL,
  data_retirada   TEXT NOT NULL,
  data_devolucao  TEXT,
  status          TEXT NOT NULL DEFAULT 'PENDENTE'
                  CHECK (status IN ('PENDENTE', 'CONCLUIDO', 'CANCELADO')),
  FOREIGN KEY (professor_id) REFERENCES professor(id),
  FOREIGN KEY (turma_id)     REFERENCES turma(id)
);

CREATE TABLE IF NOT EXISTS item_emprestimo (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  emprestimo_id           INTEGER NOT NULL,
  livro_id                INTEGER NOT NULL,
  quantidade_retirada     INTEGER NOT NULL,
  quantidade_devolvida    INTEGER NOT NULL DEFAULT 0,
  quantidade_perdida      INTEGER NOT NULL DEFAULT 0,
  quantidade_danificada   INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (emprestimo_id) REFERENCES emprestimo(id),
  FOREIGN KEY (livro_id)      REFERENCES livro(id)
);

-- Limpa tabelas para garantir carga limpa ao resetar/popular
DELETE FROM item_emprestimo;
DELETE FROM emprestimo;
DELETE FROM livro;
DELETE FROM turma;
DELETE FROM professor;
DELETE FROM sqlite_sequence WHERE name IN ('item_emprestimo', 'emprestimo', 'livro', 'turma', 'professor');

BEGIN TRANSACTION;

-- ====================================================================
-- 2. TABELA: PROFESSOR (12 registros)
-- ====================================================================
-- [1 e 2] SEM histórico -> Exclusão física definitiva permitida
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (1, 'Ana', 'Silva', 'ana.silva@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (2, 'Carlos', 'Eduardo', 'carlos.eduardo@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [3 e 4] COM histórico concluído -> Desativação com sucesso permitida
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (3, 'Juliana', 'Ferreira', 'juliana.ferreira@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (4, 'Lucas', 'Rodrigues', 'lucas.rodrigues@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [5 e 6] COM empréstimo pendente -> Desativação BLOQUEADA com erro
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (5, 'Roberto', 'Oliveira', 'roberto.oliveira@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (6, 'Patrícia', 'Costa', 'patricia.costa@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [7 e 8] INATIVOS -> Permite testar o modal de Ativação e bloqueio de novo empréstimo
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (7, 'Mateus', 'Pacheco', 'mateus.pacheco@escola.com.br', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (8, 'Clara', 'Vargas', 'clara.vargas@escola.com.br', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [9 a 12] Professores para testes de Empréstimos (Devolução Parcial, Cancelados, Multi-itens e Paginação)
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (9, 'Mariana', 'Souza', 'mariana.souza@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (10, 'Gabriel', 'Mendes', 'gabriel.mendes@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (11, 'Beatriz', 'Lima', 'beatriz.lima@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (12, 'Fernando', 'Dias', 'fernando.dias@escola.com.br', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');


-- ====================================================================
-- 3. TABELA: TURMA (12 registros)
-- ====================================================================
-- [1 e 2] SEM histórico -> Exclusão física definitiva permitida
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (1, 'Maternal I A', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (2, 'Maternal I B', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [3 e 4] COM histórico concluído -> Desativação com sucesso permitida
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (3, 'Maternal II A', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (4, 'Pré I A', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [5 e 6] COM empréstimo pendente -> Desativação BLOQUEADA com erro
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (5, 'Maternal I - Tempo Integral', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (6, 'Pré I - Vespertino', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [7 e 8] INATIVAS -> Permite testar o modal de Ativação e bloqueio de novo empréstimo
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (7, 'Pré I B', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (8, 'Pré II B', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [9 a 12] Turmas adicionais
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (9, 'Berçário I', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (10, 'Berçário II', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (11, 'Maternal II B', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (12, 'Pré II A', 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');


-- ====================================================================
-- 4. TABELA: LIVRO (14 registros)
-- ====================================================================
-- [1 e 2] SEM histórico -> Exclusão física definitiva permitida (saldo 8 e 10)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (1, 'A Bolsa Amarela', 'José Olympio', 8, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (2, 'A Casa Sonolenta', 'Ática', 10, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [3 e 4] COM histórico concluído -> Desativação com sucesso permitida
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (3, 'Reinações de Narizinho', 'Globo Livros', 6, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (4, 'Flicts', 'Melhoramentos', 5, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [5 e 6] COM empréstimo pendente -> Desativação bloqueada (saldo disponível positivo)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (5, 'O Menino Maluquinho', 'Melhoramentos', 10, 5, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (6, 'O Pequeno Príncipe', 'Agir', 12, 6, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [7 e 8] INATIVOS -> Permite testar Ativação e bloqueio de empréstimo (saldo 0)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (7, 'Menino Poti', 'Moderna', 0, 0, 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (8, 'Histórias da Cazumbinha', 'Companhia das Letrinhas', 0, 0, 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [9] Estoque abundante para testes de Realizar Empréstimo (15 total, 3 emprestados, 12 disponíveis)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (9, 'Chapeuzinho Amarelo', 'José Olympio', 15, 3, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [10] Utilizado no cenário de DEVOLUÇÃO PARCIAL (8 total, 2 emprestados restantes, 6 disponíveis)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (10, 'Ou Isto ou Aquilo', 'Global Editora', 8, 2, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [11] ESTOQUE ESGOTADO / SALDO ZERO (5 total, 5 emprestados -> 0 disponível para testar erro de saldo insuficiente)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (11, 'A Arca de Noé', 'Companhia das Letrinhas', 5, 5, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [12] Múltiplos itens e paginação (12 total, 4 emprestados, 8 disponíveis)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (12, 'Marcelo, Marmelo, Martelo', 'Salamandra', 12, 4, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [13] Empréstimo cancelado e concluído com avaria (7 total, 0 emprestados, 7 disponíveis)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (13, 'O Pote Vazio', 'Martins Fontes', 7, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [14] Múltiplos itens e paginação (10 total, 3 emprestados, 7 disponíveis)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (14, 'O Grúfalo', 'Brinque-Book', 10, 3, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');


-- ====================================================================
-- 5. TABELA: EMPRESTIMO (16 registros: 12 pendentes, 3 concluídos, 1 cancelado)
-- ====================================================================
-- [1 e 2] HISTÓRICO: CONCLUÍDOS (100% devolvidos)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (1, 3, 3, '2026-09-10T14:00:00.000Z', '2026-09-18T10:00:00.000Z', 'CONCLUIDO');

INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (2, 4, 4, '2026-09-12T09:30:00.000Z', '2026-09-20T11:00:00.000Z', 'CONCLUIDO');

-- [3 e 4] PENDENTES SIMPLES (Prontos para teste de Cancelar Empréstimo com sucesso)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (3, 5, 5, '2026-10-01T10:00:00.000Z', NULL, 'PENDENTE');

INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (4, 6, 6, '2026-10-02T13:30:00.000Z', NULL, 'PENDENTE');

-- [5] PENDENTE COM DEVOLUÇÃO PARCIAL (Retirou 4, devolveu 2. Restam 2 pendentes. Bloqueia Cancelamento!)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (5, 9, 9, '2026-10-05T08:30:00.000Z', NULL, 'PENDENTE');

-- [6] PENDENTE COM MÚLTIPLOS ITENS (Dois livros diferentes: 2 de cada, total 4 exemplares. Cancelamento repõe ambos)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (6, 11, 11, '2026-10-08T11:00:00.000Z', NULL, 'PENDENTE');

-- [7] PENDENTE COM ITENS MISTOS (Livro 12: 100% devolvido; Livro 5: pendente. Detalhes mostra badges mistas)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (7, 12, 12, '2026-10-10T14:00:00.000Z', NULL, 'PENDENTE');

-- [8] PENDENTE COM AVARIA REGISTRADA (Livro 6: retirou 3, 1 danificado, 2 pendentes. Badge "1 - Danificado". Bloqueia Cancelar!)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (8, 5, 5, '2026-10-14T09:00:00.000Z', NULL, 'PENDENTE');

-- [9 a 14] PENDENTES ADICIONAIS (Garantem > 10 itens na aba Pendentes para teste de paginação e busca)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (9, 6, 6, '2026-10-16T15:00:00.000Z', NULL, 'PENDENTE');

-- Empréstimo 10: Esgota o estoque do livro 11 (A Arca de Noé)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (10, 9, 9, '2026-10-18T10:30:00.000Z', NULL, 'PENDENTE');

INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (11, 11, 11, '2026-10-20T13:45:00.000Z', NULL, 'PENDENTE');

INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (12, 12, 12, '2026-10-22T08:15:00.000Z', NULL, 'PENDENTE');

INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (13, 3, 3, '2026-10-25T16:20:00.000Z', NULL, 'PENDENTE');

INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (14, 4, 4, '2026-10-28T09:00:00.000Z', NULL, 'PENDENTE');

-- [15] HISTÓRICO: CANCELADO (Estoque já foi recomposto, badge vermelha Cancelado)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (15, 10, 10, '2026-09-25T10:00:00.000Z', NULL, 'CANCELADO');

-- [16] HISTÓRICO: CONCLUÍDO COM AVARIA / PERDA (Retirou 2, devolveu 1, 1 perdido. Baixado 100%, concluído)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, data_devolucao, status)
VALUES (16, 9, 9, '2026-09-28T14:30:00.000Z', '2026-10-04T11:00:00.000Z', 'CONCLUIDO');


-- ====================================================================
-- 6. TABELA: ITEM_EMPRESTIMO (18 registros vinculados)
-- ====================================================================
-- Itens dos Empréstimos 1 e 2 (Concluídos com devolução total)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (1, 1, 3, 2, 2, 0, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (2, 2, 4, 1, 1, 0, 0);

-- Itens dos Empréstimos 3 e 4 (Pendentes simples intactos)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (3, 3, 5, 3, 0, 0, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (4, 4, 6, 4, 0, 0, 0);

-- Item do Empréstimo 5 (DEVOLUÇÃO PARCIAL: Retirou 4, devolveu 2, restam 2 pendentes)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (5, 5, 10, 4, 2, 0, 0);

-- Itens do Empréstimo 6 (Múltiplos itens: Livro 12 com 2, Livro 14 com 2)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (6, 6, 12, 2, 0, 0, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (7, 6, 14, 2, 0, 0, 0);

-- Itens do Empréstimo 7 (Itens mistos: Livro 12 devolvido 2/2 concluído; Livro 5 pendente 1/0)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (8, 7, 12, 2, 2, 0, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (9, 7, 5, 1, 0, 0, 0);

-- Item do Empréstimo 8 (Avaria parcial: Livro 6 retirou 3, 1 danificado, 0 devolvido -> 2 pendentes)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (10, 8, 6, 3, 0, 0, 1);

-- Itens dos Empréstimos 9 a 14 (Paginação e busca)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (11, 9, 5, 1, 0, 0, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (12, 10, 11, 5, 0, 0, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (13, 11, 12, 2, 0, 0, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (14, 12, 14, 1, 0, 0, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (15, 13, 9, 1, 0, 0, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (16, 14, 9, 2, 0, 0, 0);

-- Item do Empréstimo 15 (Cancelado: Livro 13, retirou 2)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (17, 15, 13, 2, 0, 0, 0);

-- Item do Empréstimo 16 (Concluído com perda: Livro 13, retirou 2, devolveu 1, perdeu 1)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
VALUES (18, 16, 13, 2, 1, 1, 0);

COMMIT;
