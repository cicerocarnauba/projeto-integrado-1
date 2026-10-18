import Database from 'better-sqlite3';
import { Emprestimo } from '../entities/Emprestimo.ts';
import { ItemEmprestimo } from '../entities/ItemEmprestimo.ts';
import type { StatusEmprestimo } from '../entities/Emprestimo.ts';
import type {
  ConsultarEmprestimoInput,
  ItemEmprestimoConsultaDTO,
} from '../entities/ConsultaEmprestimo.ts';

interface EmprestimoRow {
  id: number;
  professor_id: number;
  turma_id: number;
  data_retirada: string;
  status: StatusEmprestimo;
}

interface ItemEmprestimoRow {
  id: number;
  emprestimo_id: number;
  livro_id: number;
  quantidade_retirada: number;
  quantidade_devolvida: number;
  quantidade_perdida: number;
  quantidade_danificada: number;
}

export class EmprestimoDAO {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /** Filtros independentes combinados por AND, sem restringir cadastros a ATIVO. */
  public consultar(filtro: ConsultarEmprestimoInput = {}): ItemEmprestimoConsultaDTO[] {
    let sql = `
      SELECT
        i.id, e.id AS emprestimoId,
        e.professor_id AS professorId,
        TRIM(p.primeiro_nome) || ' ' || TRIM(p.sobrenome) AS professorNome,
        e.turma_id AS turmaId, t.nome AS turmaNome,
        i.livro_id AS livroId, l.titulo AS livroTitulo,
        e.data_retirada AS dataRetirada, e.status,
        i.quantidade_retirada AS quantidadeRetirada,
        i.quantidade_devolvida AS quantidadeDevolvida,
        i.quantidade_perdida AS quantidadePerdida,
        i.quantidade_danificada AS quantidadeDanificada
      FROM item_emprestimo i
      JOIN emprestimo e ON e.id = i.emprestimo_id
      JOIN professor p ON p.id = e.professor_id
      JOIN turma t ON t.id = e.turma_id
      JOIN livro l ON l.id = i.livro_id
      WHERE 1 = 1
    `;
    const params: Array<number | string> = [];

    if (filtro.professorId !== undefined) {
      sql += ` AND e.professor_id = ?`;
      params.push(filtro.professorId);
    }
    if (filtro.turmaId !== undefined) {
      sql += ` AND e.turma_id = ?`;
      params.push(filtro.turmaId);
    }
    if (filtro.livroId !== undefined) {
      sql += ` AND i.livro_id = ?`;
      params.push(filtro.livroId);
    }
    if (filtro.status !== undefined) {
      sql += ` AND e.status = ?`;
      params.push(filtro.status);
    }

    sql += ` ORDER BY e.data_retirada DESC, e.id DESC, i.id ASC`;
    const rows = this.db.prepare(sql).all(...params) as Array<
      Omit<ItemEmprestimoConsultaDTO, 'dataRetirada'> & { dataRetirada: string }
    >;
    return rows.map((row) => ({ ...row, dataRetirada: new Date(row.dataRetirada) }));
  }

  /**
   * HU19 — Realizar Empréstimo.
   * Insere o empréstimo, todos os itens e realiza a baixa do saldo disponível dos livros
   * (incrementando quantidade_emprestada) em uma transação atômica única no SQLite.
   * Se algo falhar, nada é salvo (rollback total).
   */
  public inserir(
    emprestimo: Emprestimo,
    atualizarEstoque?: (livroId: number, quantidadeRetirada: number) => void
  ): Emprestimo {
    const inserirEmprestimo = this.db.prepare(`
      INSERT INTO emprestimo
        (professor_id, turma_id, data_retirada, status)
      VALUES (?, ?, ?, ?)
    `);

    const inserirItem = this.db.prepare(`
      INSERT INTO item_emprestimo
        (emprestimo_id, livro_id, quantidade_retirada, quantidade_devolvida, quantidade_perdida, quantidade_danificada)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transacao = this.db.transaction((emp: Emprestimo) => {
      const info = inserirEmprestimo.run(
        emp.professorId,
        emp.turmaId,
        emp.dataRetirada.toISOString(),
        emp.status
      );
      emp.id = Number(info.lastInsertRowid);

      for (const item of emp.itens) {
        const itemInfo = inserirItem.run(
          emp.id,
          item.livroId,
          item.quantidadeRetirada,
          item.quantidadeDevolvida,
          item.quantidadePerdida,
          item.quantidadeDanificada
        );
        item.id = Number(itemInfo.lastInsertRowid);
        item.emprestimoId = emp.id;

        // Baixa atômica do saldo disponível de cada livro dentro da mesma transação
        if (atualizarEstoque) {
          atualizarEstoque(item.livroId, item.quantidadeRetirada);
        }
      }

      return emp;
    });

    return transacao(emprestimo);
  }

  public buscarPorId(id: number): Emprestimo | null {
    const row = this.db
      .prepare(`SELECT * FROM emprestimo WHERE id = ?`)
      .get(id) as EmprestimoRow | undefined;

    if (!row) return null;

    const itensRows = this.db
      .prepare(`SELECT * FROM item_emprestimo WHERE emprestimo_id = ?`)
      .all(id) as ItemEmprestimoRow[];

    const itens = itensRows.map(
      (r) =>
        new ItemEmprestimo({
          id: r.id,
          emprestimoId: r.emprestimo_id,
          livroId: r.livro_id,
          quantidadeRetirada: r.quantidade_retirada,
          quantidadeDevolvida: r.quantidade_devolvida,
          quantidadePerdida: r.quantidade_perdida,
          quantidadeDanificada: r.quantidade_danificada,
        })
    );

    return new Emprestimo({
      id: row.id,
      professorId: row.professor_id,
      turmaId: row.turma_id,
      dataRetirada: new Date(row.data_retirada),
      status: row.status,
      itens,
    });
  }
}
