import Database from 'better-sqlite3';
import { Turma } from '../entities/Turma.ts';
import type { StatusCadastro } from '../entities/Turma.ts';

interface TurmaRow {
  id: number;
  nome: string;
  status: StatusCadastro;
  data_cadastro: string;
  data_atualizacao: string;
}

// Pure Fabrication: isola SQL do restante da aplicação
export class TurmaDAO {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    try {
      // RNF04: Garante que o LOWER() do SQLite processe caracteres acentuados da língua portuguesa
      this.db.function('lower', (str: unknown) => (typeof str === 'string' ? str.toLowerCase() : str));
    } catch {
      // Função já registrada na conexão
    }
  }

  public inserir(turma: Turma): Turma {
    const stmt = this.db.prepare(`
      INSERT INTO turma
        (nome, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(
      turma.nome,
      turma.status,
      turma.dataCadastro.toISOString(),
      turma.dataAtualizacao.toISOString()
    );
    turma.id = Number(info.lastInsertRowid);
    return turma;
  }

  public buscarPorId(id: number): Turma | null {
    const row = this.db
      .prepare(`SELECT * FROM turma WHERE id = ?`)
      .get(id) as TurmaRow | undefined;
    return row ? this.mapRowToEntity(row) : null;
  }

  public buscarPorNome(nome: string): Turma | null {
    // RN07 — chave única normalizada dos dois lados
    const row = this.db
      .prepare(
        `SELECT * FROM turma
         WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))`
      )
      .get(nome) as TurmaRow | undefined;
    return row ? this.mapRowToEntity(row) : null;
  }

  /**
   * HU13 — Consultar Turma
   */
  public consultar(filtro: {
    nome?: string;
    incluirInativos?: boolean;
  }): Turma[] {
    const apenasAtivas = filtro.incluirInativos === false;
    const nome = (filtro.nome ?? '').trim();

    let sql = `SELECT * FROM turma WHERE 1 = 1`;
    const params: string[] = [];

    if (apenasAtivas) {
      sql += ` AND status = 'ATIVO'`;
    }

    if (nome) {
      sql += ` AND LOWER(TRIM(nome)) LIKE LOWER(?)`;
      params.push(`%${nome}%`);
    }

    sql += ` ORDER BY
      CASE status WHEN 'ATIVO' THEN 0 ELSE 1 END,
      nome ASC`;

    const rows = this.db.prepare(sql).all(...params) as TurmaRow[];
    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * HU18 — Atualiza o status da turma (ATIVO/INATIVO).
   */
  public atualizarStatus(id: number, status: StatusCadastro): void {
    this.db
      .prepare(
        `UPDATE turma
         SET status = ?, data_atualizacao = ?
         WHERE id = ?`
      )
      .run(status, new Date().toISOString(), id);
  }

  /**
   * HU14 — Atualiza o nome da turma.
   */
  public atualizar(turma: Turma): void {
    this.db
      .prepare(
        `UPDATE turma
         SET nome = ?, data_atualizacao = ?
         WHERE id = ?`
      )
      .run(
        turma.nome,
        turma.dataAtualizacao.toISOString(),
        turma.id
      );
  }

  /**
   * HU16 — Exclusão definitiva do banco de dados.
   * Só deve ser chamada quando a turma NÃO possui histórico de empréstimos.
   */
  public excluir(id: number): void {
    this.db.prepare(`DELETE FROM turma WHERE id = ?`).run(id);
  }

  /**
   * HU17 — Verifica se a turma possui algum empréstimo pendente.
   */
  public possuiEmprestimoPendente(turmaId: number): boolean {
    try {
      const temTabela = this.db
        .prepare(
          `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'emprestimo'`
        )
        .get();
      if (!temTabela) return false;

      const row = this.db
        .prepare(
          `SELECT COUNT(*) as count FROM emprestimo WHERE turma_id = ? AND status = 'PENDENTE'`
        )
        .get(turmaId) as { count: number } | undefined;

      return !!row && row.count > 0;
    } catch {
      return false;
    }
  }

  /**
   * HU17 — Verifica se a turma possui histórico de empréstimos.
   * Uma turma tem histórico se existe qualquer registro em `emprestimo`
   * associado a ela (independente do status: PENDENTE, CONCLUIDO ou CANCELADO).
   */
  public possuiHistoricoEmprestimos(turmaId: number): boolean {
    try {
      const temTabela = this.db
        .prepare(
          `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'emprestimo'`
        )
        .get();
      if (!temTabela) return false;

      const row = this.db
        .prepare(
          `SELECT COUNT(*) as count FROM emprestimo WHERE turma_id = ?`
        )
        .get(turmaId) as { count: number } | undefined;

      return !!row && row.count > 0;
    } catch {
      return false;
    }
  }

  private mapRowToEntity(row: TurmaRow): Turma {
    return new Turma({
      id: row.id,
      nome: row.nome,
      status: row.status,
      dataCadastro: new Date(row.data_cadastro),
      dataAtualizacao: new Date(row.data_atualizacao),
    });
  }
}