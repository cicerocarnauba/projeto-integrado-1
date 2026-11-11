import Database from 'better-sqlite3';
import { Professor } from '../entities/Professor.ts';
import type { StatusCadastro } from '../entities/Professor.ts';

interface ProfessorRow {
  id: number;
  primeiro_nome: string;
  sobrenome: string;
  email: string;
  status: StatusCadastro;
  data_cadastro: string;
  data_atualizacao: string;
}

// Pure Fabrication: isola SQL do restante da aplicação
export class ProfessorDAO {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  public inserir(professor: Professor): Professor {
    const stmt = this.db.prepare(`
      INSERT INTO professor
        (primeiro_nome, sobrenome, email, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      professor.primeiroNome,
      professor.sobrenome,
      professor.email,
      professor.status,
      professor.dataCadastro.toISOString(),
      professor.dataAtualizacao.toISOString()
    );
    professor.id = Number(info.lastInsertRowid);
    return professor;
  }

  public buscarPorId(id: number): Professor | null {
    const row = this.db
      .prepare(`SELECT * FROM professor WHERE id = ?`)
      .get(id) as ProfessorRow | undefined;
    return row ? this.mapRowToEntity(row) : null;
  }

  public buscarPorEmail(email: string): Professor | null {
    const row = this.db
      .prepare(
        `SELECT * FROM professor
         WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))`
      )
      .get(email) as ProfessorRow | undefined;
    return row ? this.mapRowToEntity(row) : null;
  }

  /**
   * Consulta com filtros (RF09).
   * - `nome`: busca parcial em primeiro nome OU sobrenome OU nome completo.
   * - `email`: busca parcial em e-mail.
   * - `incluirInativos`: por padrão `false` (retorna só ATIVOS).
   *
   * Quando ambos os filtros são informados, basta um deles corresponder.
   * Buscas por texto são case-insensitive e ignoram espaços nas extremidades (RNF04).
   */
  public consultar(filtro: {
    nome?: string;
    email?: string;
    incluirInativos?: boolean;
  }): Professor[] {
    const incluirInativos = filtro.incluirInativos ?? false;
    const nome = (filtro.nome ?? '').trim();
    const email = (filtro.email ?? '').trim();

    let sql = `SELECT * FROM professor WHERE 1 = 1`;
    const params: string[] = [];

    if (!incluirInativos) {
      sql += ` AND status = 'ATIVO'`;
    }

    const condicoes: string[] = [];

    if (nome) {
      condicoes.push(`(
        LOWER(TRIM(primeiro_nome)) LIKE LOWER(?) OR
        LOWER(TRIM(sobrenome))     LIKE LOWER(?) OR
        LOWER(TRIM(primeiro_nome) || ' ' || TRIM(sobrenome)) LIKE LOWER(?)
      )`);
      const like = `%${nome}%`;
      params.push(like, like, like);
    }

    if (email) {
      condicoes.push(`LOWER(TRIM(email)) LIKE LOWER(?)`);
      params.push(`%${email}%`);
    }

    if (condicoes.length > 0) {
      sql += ` AND (${condicoes.join(' OR ')})`;
    }

    sql += ` ORDER BY primeiro_nome ASC, sobrenome ASC`;

    const rows = this.db.prepare(sql).all(...params) as ProfessorRow[];
    return rows.map((row) => this.mapRowToEntity(row));
  }

  public excluir(id: number): void {
    this.db.prepare(`DELETE FROM professor WHERE id = ?`).run(id);
  }

  public atualizarStatus(id: number, status: StatusCadastro): void {
    this.db
      .prepare(
        `UPDATE professor
         SET status = ?, data_atualizacao = ?
         WHERE id = ?`
      )
      .run(status, new Date().toISOString(), id);
  }

  public atualizar(professor: Professor): void {
    this.db
      .prepare(
        `UPDATE professor
         SET primeiro_nome = ?, sobrenome = ?, email = ?, data_atualizacao = ?
         WHERE id = ?`
      )
      .run(
        professor.primeiroNome,
        professor.sobrenome,
        professor.email,
        professor.dataAtualizacao.toISOString(),
        professor.id
      );
  }

  /**
   * HU10 / HU11 — Verifica se o professor possui histórico de empréstimos.
   * Um professor tem histórico se existe qualquer registro em `emprestimo`
   * associado a ele (independente do status: PENDENTE, CONCLUIDO ou CANCELADO).
   */
  public possuiHistoricoEmprestimos(professorId: number): boolean {
    try {
      const temTabela = this.db
        .prepare(
          `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'emprestimo'`
        )
        .get();
      if (!temTabela) return false;

      const row = this.db
        .prepare(
          `SELECT COUNT(*) as count FROM emprestimo WHERE professor_id = ?`
        )
        .get(professorId) as { count: number } | undefined;

      return !!row && row.count > 0;
    } catch {
      return false;
    }
  }

  /**
   * HU10 / HU11 — Verifica se o professor possui empréstimo com status PENDENTE.
   */
  public possuiEmprestimoPendente(professorId: number): boolean {
    try {
      const temTabela = this.db
        .prepare(
          `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'emprestimo'`
        )
        .get();
      if (!temTabela) return false;

      const row = this.db
        .prepare(
          `SELECT COUNT(*) as count FROM emprestimo
           WHERE professor_id = ? AND status = 'PENDENTE'`
        )
        .get(professorId) as { count: number } | undefined;

      return !!row && row.count > 0;
    } catch {
      return false;
    }
  }

  private mapRowToEntity(row: ProfessorRow): Professor {
    return new Professor({
      id: row.id,
      primeiroNome: row.primeiro_nome,
      sobrenome: row.sobrenome,
      email: row.email,
      status: row.status,
      dataCadastro: new Date(row.data_cadastro),
      dataAtualizacao: new Date(row.data_atualizacao),
    });
  }
}