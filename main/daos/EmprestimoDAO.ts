import Database from 'better-sqlite3';
import { Emprestimo } from '../entities/Emprestimo.ts';
import { ItemEmprestimo } from '../entities/ItemEmprestimo.ts';
import type { StatusEmprestimo } from '../entities/Emprestimo.ts';
import type {
  ConsultarEmprestimoInput,
  ItemEmprestimoConsultaDTO,
  EmprestimoDetalhesDTO,
  ItemEmprestimoDetalheDTO,
  StatusItemEmprestimo,
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

  /** Valida, repõe o saldo e cancela na mesma transação, preservando os itens do histórico. */
  public cancelar(
    id: number,
    reporEstoque: (livroId: number, quantidadeRetirada: number) => void
  ): Emprestimo {
    const transacao = this.db.transaction(() => {
      const emprestimo = this.buscarPorId(id);
      if (!emprestimo) {
        throw new Error('Empréstimo não encontrado.');
      }

      emprestimo.cancelar();

      for (const item of emprestimo.itens) {
        reporEstoque(item.livroId, item.quantidadeRetirada);
      }

      this.db.prepare(`UPDATE emprestimo SET status = 'CANCELADO' WHERE id = ?`).run(id);
      return emprestimo;
    });

    // Reserva a escrita antes da leitura para impedir cancelamentos concorrentes.
    return transacao.immediate();
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

  /**
   * Busca um empréstimo por ID com todos os dados associados:
   * dados do professor (nome completo), turma (nome), datas (retirada e devolução),
   * status geral, quantidade total de exemplares e o agrupamento detalhado dos itens
   * contendo as informações completas de cada livro (título, editora, quantidade de exemplares, etc).
   */
  public buscarDetalhesPorId(id: number): EmprestimoDetalhesDTO | null {
    const row = this.db
      .prepare(`
        SELECT
          e.*,
          TRIM(p.primeiro_nome) || ' ' || TRIM(p.sobrenome) AS professor_nome,
          t.nome AS turma_nome
        FROM emprestimo e
        LEFT JOIN professor p ON p.id = e.professor_id
        LEFT JOIN turma t ON t.id = e.turma_id
        WHERE e.id = ?
      `)
      .get(id) as (EmprestimoRow & { professor_nome?: string; turma_nome?: string; data_devolucao?: string | null }) | undefined;

    if (!row) return null;

    // Detecta se a coluna editora existe na tabela livro (retrocompatibilidade com schemas parciais de testes)
    const colunasLivro = (this.db.pragma('table_info(livro)') as Array<{ name: string }>).map((c) => c.name);
    const temEditora = colunasLivro.includes('editora');
    const selectEditora = temEditora ? 'l.editora AS editora' : "'' AS editora";

    const itensRows = this.db
      .prepare(`
        SELECT
          i.id,
          i.livro_id AS livroId,
          l.titulo AS livroTitulo,
          ${selectEditora},
          i.quantidade_retirada AS quantidadeRetirada,
          i.quantidade_devolvida AS quantidadeDevolvida,
          i.quantidade_perdida AS quantidadePerdida,
          i.quantidade_danificada AS quantidadeDanificada
        FROM item_emprestimo i
        LEFT JOIN livro l ON l.id = i.livro_id
        WHERE i.emprestimo_id = ?
        ORDER BY i.id ASC
      `)
      .all(id) as Array<{
        id: number;
        livroId: number;
        livroTitulo: string | null;
        editora: string | null;
        quantidadeRetirada: number;
        quantidadeDevolvida: number;
        quantidadePerdida: number;
        quantidadeDanificada: number;
      }>;

    let totalExemplares = 0;
    const itens: ItemEmprestimoDetalheDTO[] = itensRows.map((item) => {
      totalExemplares += item.quantidadeRetirada;
      const baixados = (item.quantidadeDevolvida ?? 0) + (item.quantidadePerdida ?? 0) + (item.quantidadeDanificada ?? 0);
      const pendente = item.quantidadeRetirada > baixados;
      const statusItem: StatusItemEmprestimo = pendente ? 'PENDENTE' : 'CONCLUIDO';
      const titulo = item.livroTitulo ?? '';
      const editora = item.editora ?? '';

      return {
        id: item.id,
        livroId: item.livroId,
        livroTitulo: titulo,
        titulo: titulo,
        editora: editora,
        quantidadeExemplar: item.quantidadeRetirada,
        quantidadeEmprestada: item.quantidadeRetirada,
        quantidadeRetirada: item.quantidadeRetirada,
        quantidadeDevolvida: item.quantidadeDevolvida ?? 0,
        quantidadePerdida: item.quantidadePerdida ?? 0,
        quantidadeDanificada: item.quantidadeDanificada ?? 0,
        status: statusItem,
      };
    });

    const dataDevolucao = ('data_devolucao' in row && row.data_devolucao)
      ? new Date(row.data_devolucao)
      : null;

    return {
      id: row.id,
      professorId: row.professor_id,
      professorNome: row.professor_nome ?? '',
      turmaId: row.turma_id,
      turmaNome: row.turma_nome ?? '',
      dataRetirada: new Date(row.data_retirada),
      dataDevolucao,
      quantidadeExemplares: totalExemplares,
      status: row.status,
      itens,
    };
  }
}
