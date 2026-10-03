import Database from 'better-sqlite3';
import { Emprestimo } from '../entities/Emprestimo.ts';
import { ItemEmprestimo } from '../entities/ItemEmprestimo.ts';
import type { StatusEmprestimo } from '../entities/Emprestimo.ts';

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

  /**
   * HU19 — Realizar Empréstimo.
   * Insere o empréstimo e todos os itens em uma transação atômica.
   * Se algo falhar, nada é salvo (rollback).
   */
  public inserir(emprestimo: Emprestimo): Emprestimo {
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