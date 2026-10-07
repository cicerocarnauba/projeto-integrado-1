-- ====================================================================
-- Script de Carga Inicial de Dados de Demonstração (Seed)
-- Sistema de Gerenciamento de Acervo de Biblioteca Escolar
-- Estrutura enxuta para testes de bancada e apresentação:
-- Exatamente 2 de cada cenário para cada entidade (Professor, Turma, Livro):
-- 1. [Excluir]: 2 entidades sem histórico (permite Excluir fisicamente)
-- 2. [Desativar Sucesso]: 2 entidades com histórico concluído (permite Desativar)
-- 3. [Desativar Erro]: 2 entidades com empréstimo pendente (bloqueia Desativação)
-- 4. [Ativar]: 2 entidades com status Inativo (permite Ativar)
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
-- 2. TABELA: PROFESSOR (8 registros)
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

-- [7 e 8] INATIVOS -> Permite testar o modal de Ativação
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (7, 'Mateus', 'Pacheco', 'mateus.pacheco@escola.com.br', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO professor (id, primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
VALUES (8, 'Clara', 'Vargas', 'clara.vargas@escola.com.br', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');


-- ====================================================================
-- 3. TABELA: TURMA (8 registros)
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

-- [7 e 8] INATIVAS -> Permite testar o modal de Ativação
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (7, 'Pré I B', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO turma (id, nome, status, data_cadastro, data_atualizacao)
VALUES (8, 'Pré II B', 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');


-- ====================================================================
-- 4. TABELA: LIVRO (8 registros)
-- ====================================================================
-- [1 e 2] SEM histórico -> Exclusão física definitiva permitida
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (1, 'A Bolsa Amarela', 'José Olympio', 8, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (2, 'A Casa Sonolenta', 'Ática', 10, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [3 e 4] COM histórico concluído -> Desativação com sucesso permitida
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (3, 'Reinações de Narizinho', 'Globo Livros', 6, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (4, 'Flicts', 'Melhoramentos', 5, 0, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [5 e 6] COM empréstimo pendente -> Desativação BLOQUEADA com erro (quantidade_emprestada > 0)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (5, 'O Menino Maluquinho', 'Melhoramentos', 10, 3, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (6, 'O Pequeno Príncipe', 'Agir', 12, 4, 'ATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');

-- [7 e 8] INATIVOS -> Permite testar o modal de Ativação (saldo 0)
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (7, 'Menino Poti', 'Moderna', 0, 0, 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');
INSERT INTO livro (id, titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
VALUES (8, 'Histórias da Cazumbinha', 'Companhia das Letrinhas', 0, 0, 'INATIVO', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z');


-- ====================================================================
-- 5. TABELA: EMPRESTIMO (4 registros vinculados)
-- ====================================================================
-- Empréstimo 1: CONCLUIDO (Professor 3: Juliana, Turma 3: Maternal II A, Livro 3: Reinações de Narizinho)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, status)
VALUES (1, 3, 3, '2026-09-10T14:00:00.000Z', 'CONCLUIDO');

-- Empréstimo 2: CONCLUIDO (Professor 4: Lucas, Turma 4: Pré I A, Livro 4: Flicts)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, status)
VALUES (2, 4, 4, '2026-09-12T09:30:00.000Z', 'CONCLUIDO');

-- Empréstimo 3: PENDENTE (Professor 5: Roberto, Turma 5: Maternal I - Tempo Integral, Livro 5: O Menino Maluquinho)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, status)
VALUES (3, 5, 5, '2026-10-01T10:00:00.000Z', 'PENDENTE');

-- Empréstimo 4: PENDENTE (Professor 6: Patrícia, Turma 6: Pré I - Vespertino, Livro 6: O Pequeno Príncipe)
INSERT INTO emprestimo (id, professor_id, turma_id, data_retirada, status)
VALUES (4, 6, 6, '2026-10-02T13:30:00.000Z', 'PENDENTE');


-- ====================================================================
-- 6. TABELA: ITEM_EMPRESTIMO (4 registros vinculados)
-- ====================================================================
-- Itens dos Empréstimos CONCLUÍDOS (devolução completa)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida)
VALUES (1, 1, 3, 2, 2);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida)
VALUES (2, 2, 4, 1, 1);

-- Itens dos Empréstimos PENDENTES (devolução = 0, bloqueia devolução do livro)
INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida)
VALUES (3, 3, 5, 3, 0);

INSERT INTO item_emprestimo (id, emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida)
VALUES (4, 4, 6, 4, 0);

COMMIT;
