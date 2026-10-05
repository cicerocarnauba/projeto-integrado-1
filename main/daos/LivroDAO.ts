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

  /**
   * RF02 — Atualizar dados de um livro existente no SQLite
   */
  public atualizar(livro: Livro): Livro {
    if (livro.id === null || livro.id === undefined) {
      throw new Error('Não é possível atualizar um livro sem ID.');
    }

    const stmt = this.db.prepare(`
      UPDATE livro
      SET titulo = ?,
          editora = ?,
          quantidade_total = ?,
          quantidade_emprestada = ?,
          status = ?,
          data_atualizacao = ?
      WHERE id = ?
    `);

    stmt.run(
      livro.titulo,
      livro.editora,
      livro.quantidadeTotal,
      livro.quantidadeEmprestada,
      livro.status,
      livro.dataAtualizacao.toISOString(),
      livro.id
    );

    return livro;
  }

  public buscarPorId(id: number): Livro | null {
    const row = this.db
      .prepare(`SELECT * FROM livro WHERE id = ?`)
      .get(id) as LivroRow | undefined;
    return row ? this.mapRowToEntity(row) : null;
  }

  /**
   * RF03 / RN04 — Exclusão física definitiva do livro no SQLite.
   * Só deve ser executada caso o livro não possua histórico de empréstimos.
   */
  public excluir(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM livro WHERE id = ?`);
    const info = stmt.run(id);
    return info.changes > 0;
  }

  /**
   * RN04 — Verifica se o livro possui histórico de empréstimos.
   * Critérios:
   * 1. Exemplares atualmente emprestados (quantidade_emprestada > 0).
   * 2. Registros associados nas tabelas de empréstimos (ex.: item_emprestimo ou emprestimo),
   *    garantindo compatibilidade com o esquema atual e futuras expansões do banco.
   */
  public possuiHistoricoEmprestimos(id: number): boolean {
    const livro = this.buscarPorId(id);
    if (!livro) {
      return false;
    }

    if (livro.quantidadeEmprestada > 0) {
      return true;
    }

    // Consulta dinâmica caso as tabelas de empréstimos já tenham sido criadas no SQLite
    try {
      const temItemEmprestimo = this.db
        .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'item_emprestimo'`)
        .get();
      if (temItemEmprestimo) {
        const row = this.db
          .prepare(`SELECT COUNT(*) as count FROM item_emprestimo WHERE livro_id = ?`)
          .get(id) as { count: number } | undefined;
        if (row && row.count > 0) {
          return true;
        }
      }

      const temEmprestimo = this.db
        .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'emprestimo'`)
        .get();
      if (temEmprestimo) {
        const cols = this.db.prepare(`PRAGMA table_info(emprestimo)`).all() as Array<{ name: string }>;
        if (cols.some((c) => c.name === 'livro_id')) {
          const row = this.db
            .prepare(`SELECT COUNT(*) as count FROM emprestimo WHERE livro_id = ?`)
            .get(id) as { count: number } | undefined;
          if (row && row.count > 0) {
            return true;
          }
        }
      }
    } catch {
      // Caso ocorra alguma inconsistência na verificação das tabelas auxiliares, assume false
    }

    return false;
  }

  /**
   * HU04 / RN04 — Verifica se o livro possui algum empréstimo com status "PENDENTE".
   * A desativação manual é bloqueada enquanto houver empréstimos pendentes associados.
   * Consulta a tabela item_emprestimo JOIN emprestimo filtrando status = 'PENDENTE'.
   */
  public possuiEmprestimoPendente(id: number): boolean {
    const livro = this.buscarPorId(id);
    if (!livro) {
      return false;
    }

    if (livro.quantidadeEmprestada > 0) {
      return true;
    }

    try {
      const temItemEmprestimo = this.db
        .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'item_emprestimo'`)
        .get();
      if (!temItemEmprestimo) {
        return false;
      }

      const row = this.db
        .prepare(`
          SELECT COUNT(*) as count
          FROM item_emprestimo ie
          INNER JOIN emprestimo e ON e.id = ie.emprestimo_id
          WHERE ie.livro_id = ?
            AND e.status = 'PENDENTE'
        `)
        .get(id) as { count: number } | undefined;

      return !!(row && row.count > 0);
    } catch {
      return false;
    }
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
   *
   * Regras:
   * - `incluirInativos`: por padrão `false` (retorna só ATIVOS);
   *   quando `true`, traz também INATIVOS (RN04).
   * - Os termos informados (`termo`, `titulo`, `editora`) são combinados com **OR**:
   *   basta o termo bater em QUALQUER um dos campos
   *   (título OR editora).
   *
   * Buscas por texto são case-insensitive e ignoram espaços nas extremidades (RNF04).
   * Ordenação: primeiro os ATIVOS, depois INATIVOS; dentro de cada grupo,
   * em ordem alfabética por título e editora.
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

    const condicoes: string[] = [];

    if (termo) {
      condicoes.push(`(
        LOWER(TRIM(titulo))  LIKE LOWER(?) OR
        LOWER(TRIM(editora)) LIKE LOWER(?)
      )`);
      const like = `%${termo}%`;
      params.push(like, like);
    }

    if (titulo) {
      condicoes.push(`LOWER(TRIM(titulo)) LIKE LOWER(?)`);
      params.push(`%${titulo}%`);
    }

    if (editora) {
      condicoes.push(`LOWER(TRIM(editora)) LIKE LOWER(?)`);
      params.push(`%${editora}%`);
    }

    if (condicoes.length > 0) {
      sql += ` AND (${condicoes.join(' OR ')})`;
    }

    // Ordenação: primeiro ATIVOS, depois INATIVOS; em cada grupo, por título e editora
    sql += ` ORDER BY
      CASE status WHEN 'ATIVO' THEN 0 ELSE 1 END,
      titulo ASC,
      editora ASC`;

    const rows = this.db.prepare(sql).all(...params) as LivroRow[];
    return rows.map((row) => this.mapRowToEntity(row));
  }
    /**
   * HU19 — Incrementa a quantidade emprestada de um livro.
   * Usado ao registrar um novo empréstimo.
   */
  public incrementarEmprestada(livroId: number, quantidade: number): void {
    this.db
      .prepare(
        `UPDATE livro
         SET quantidade_emprestada = quantidade_emprestada + ?,
             data_atualizacao = ?
         WHERE id = ?`
      )
      .run(quantidade, new Date().toISOString(), livroId);
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