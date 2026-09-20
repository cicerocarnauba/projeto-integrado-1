import Database from 'better-sqlite3';
import { Livro } from '../entities/Livro.ts';
import type { StatusCadastro } from '../entities/Livro.ts';

interface LivroRow {
  id: number;
  titulo: string;
  editora: string;
  quantidade_total: number;
  quantidade_emprestada: number;
  status: StatusCadastro;
  data_cadastro: string;
  data_atualizacao: string;
}

// Pure Fabrication: isola o SQL do SQLite do restante da aplicação
export class LivroDAO {
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

  /**
   * RF01 — Inserção de um novo livro no SQLite
   */
  public inserir(livro: Livro): Livro {
    const stmt = this.db.prepare(`
      INSERT INTO livro
        (titulo, editora, quantidade_total, quantidade_emprestada, status, data_cadastro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      livro.titulo,
      livro.editora,
      livro.quantidadeTotal,
      livro.quantidadeEmprestada,
      livro.status,
      livro.dataCadastro.toISOString(),
      livro.dataAtualizacao.toISOString()
    );
    livro.id = Number(info.lastInsertRowid);
    return livro;
  }

  public buscarPorId(id: number): Livro | null {
    const row = this.db
      .prepare(`SELECT * FROM livro WHERE id = ?`)
      .get(id) as LivroRow | undefined;
    return row ? this.mapRowToEntity(row) : null;
  }

  /**
   * RN06 — Chave única: combinação de Título e Editora.
   * Aplica LOWER(TRIM(...)) para garantir unicidade sem diferenciar
   * maiúsculas/minúsculas nem espaços nas extremidades (RNF04).
   * Consulta tanto registros ATIVOS quanto INATIVOS.
   */
  public buscarPorTituloEEditora(titulo: string, editora: string): Livro | null {
    const row = this.db
      .prepare(
        `SELECT * FROM livro
         WHERE LOWER(TRIM(titulo)) = LOWER(TRIM(?))
           AND LOWER(TRIM(editora)) = LOWER(TRIM(?))`
      )
      .get(titulo, editora) as LivroRow | undefined;
    return row ? this.mapRowToEntity(row) : null;
  }

  /**
   * RF04 — Consultar Livro
   * - `titulo`: busca parcial em título.
   * - `editora`: busca parcial em editora.
   * - `termo`: busca parcial em título OU editora.
   * - `incluirInativos`: por padrão `false` (retorna só ATIVOS); quando `true`, traz também INATIVOS (RN04).
   * 
   * Buscas por texto são case-insensitive e ignoram espaços nas extremidades (RNF04).
   * Ordenação: primeiro os ATIVOS, depois INATIVOS; dentro de cada grupo, em ordem alfabética por título e editora.
   */
  public consultar(filtro: {
    titulo?: string;
    editora?: string;
    termo?: string;
    incluirInativos?: boolean;
  }): Livro[] {
    const incluirInativos = filtro.incluirInativos ?? false;
    const titulo = (filtro.titulo ?? '').trim();
    const editora = (filtro.editora ?? '').trim();
    const termo = (filtro.termo ?? '').trim();

    let sql = `SELECT * FROM livro WHERE 1 = 1`;
    const params: string[] = [];

    if (!incluirInativos) {
      sql += ` AND status = 'ATIVO'`;
    }

    if (termo) {
      sql += ` AND (
        LOWER(TRIM(titulo))  LIKE LOWER(?) OR
        LOWER(TRIM(editora)) LIKE LOWER(?)
      )`;
      const like = `%${termo}%`;
      params.push(like, like);
    }

    if (titulo) {
      sql += ` AND LOWER(TRIM(titulo)) LIKE LOWER(?)`;
      params.push(`%${titulo}%`);
    }

    if (editora) {
      sql += ` AND LOWER(TRIM(editora)) LIKE LOWER(?)`;
      params.push(`%${editora}%`);
    }

    // Ordenação: primeiro ATIVOS, depois INATIVOS; em cada grupo, por título e editora
    sql += ` ORDER BY
      CASE status WHEN 'ATIVO' THEN 0 ELSE 1 END,
      titulo ASC,
      editora ASC`;

    const rows = this.db.prepare(sql).all(...params) as LivroRow[];
    return rows.map((row) => this.mapRowToEntity(row));
  }

  private mapRowToEntity(row: LivroRow): Livro {
    return new Livro({
      id: row.id,
      titulo: row.titulo,
      editora: row.editora,
      quantidadeTotal: row.quantidade_total,
      quantidadeEmprestada: row.quantidade_emprestada,
      status: row.status,
      dataCadastro: new Date(row.data_cadastro),
      dataAtualizacao: new Date(row.data_atualizacao),
    });
  }
}
