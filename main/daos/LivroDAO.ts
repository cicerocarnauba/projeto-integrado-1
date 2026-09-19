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
