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
        LOWER(TRIM(sobrenome))     LIKE LOWER(?)
      )`);
      const like = `%${nome}%`;
      params.push(like, like);
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

  /**
   * HU10 — Exclusão definitiva do banco de dados.
   */
  public excluir(id: number): void {
    this.db.prepare(`DELETE FROM professor WHERE id = ?`).run(id);
  }

  /**
   * HU10 — Atualiza o status do professor (ATIVO/INATIVO).
   */
  public atualizarStatus(id: number, status: StatusCadastro): void {
    this.db
      .prepare(
        `UPDATE professor
         SET status = ?, data_atualizacao = ?
         WHERE id = ?`
      )
      .run(status, new Date().toISOString(), id);
  }

  /**
   * HU08 — Atualiza os dados editáveis do professor.
   */
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
   * HU10 — Verifica se o professor possui algum empréstimo pendente.
   */
  public possuiEmprestimoPendente(_professorId: number): boolean {
    // TODO: Substituir por consulta real quando a tabela `emprestimo` existir.
    return false;
  }

  /**
   * HU10 — Verifica se o professor possui histórico de empréstimos.
   */
  public possuiHistoricoEmprestimos(_professorId: number): boolean {
    // TODO: Substituir por consulta real quando a tabela `emprestimo` existir.
    return false;
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