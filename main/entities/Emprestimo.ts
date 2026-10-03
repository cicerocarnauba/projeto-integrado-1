import { ItemEmprestimo } from './ItemEmprestimo.ts';

export type StatusEmprestimo = 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO';

// Emprestimo — representa o registro geral de uma retirada.
// Vincula um professor, uma turma, a data e uma lista de itens.
export class Emprestimo {
  id: number | null;
  professorId: number;
  turmaId: number;
  dataRetirada: Date;
  status: StatusEmprestimo;
  itens: ItemEmprestimo[];

  constructor(props: {
    id?: number | null;
    professorId: number;
    turmaId: number;
    dataRetirada?: Date;
    status?: StatusEmprestimo;
    itens?: ItemEmprestimo[];
  }) {
    this.id = props.id ?? null;
    this.professorId = props.professorId;
    this.turmaId = props.turmaId;
    this.dataRetirada = props.dataRetirada ?? new Date();
    this.status = props.status ?? 'PENDENTE';
    this.itens = props.itens ?? [];
  }

  public getTotalPendente(): number {
    return this.itens.reduce((acc, item) => acc + item.getQuantidadePendente(), 0);
  }

  public isTotalmenteConcluido(): boolean {
    return this.itens.every((item) => item.isTotalmenteBaixado());
  }

  public recalcularStatus(): void {
    if (this.status === 'CANCELADO') return;
    this.status = this.isTotalmenteConcluido() ? 'CONCLUIDO' : 'PENDENTE';
  }
}