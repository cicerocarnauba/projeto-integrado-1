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
   * Consulta com filtros (RF13).
   * - `nome`: busca parcial em nome.
   * - `incluirInativos`: por padrão `false` (retorna só ATIVAS).
   * Buscas por texto são case-insensitive e ignoram espaços nas extremidades (RNF04).
   *
   * Ordenação (RF13): primeiro as ATIVAS, depois as INATIVAS; dentro de cada grupo, por nome.
   */
  public consultar(filtro: {
    nome?: string;
    incluirInativos?: boolean;
  }): Turma[] {
    const incluirInativos = filtro.incluirInativos ?? false;
    const nome = (filtro.nome ?? '').trim();

    let sql = `SELECT * FROM turma WHERE 1 = 1`;
    const params: string[] = [];

    if (!incluirInativos) {
      sql += ` AND status = 'ATIVO'`;
    }

    if (nome) {
      sql += ` AND LOWER(TRIM(nome)) LIKE LOWER(?)`;
      params.push(`%${nome}%`);
    }

    // RF13 — Ativas primeiro, depois Inativas; em cada grupo, ordem alfabética
    sql += ` ORDER BY
      CASE status WHEN 'ATIVO' THEN 0 ELSE 1 END,
      nome ASC`;

    const rows = this.db.prepare(sql).all(...params) as TurmaRow[];
    return rows.map((row) => this.mapRowToEntity(row));
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