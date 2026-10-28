export type StatusEmprestimo = "PENDENTE" | "CONCLUIDO" | "CANCELADO";
export type StatusItemEmprestimo = "PENDENTE" | "CONCLUIDO" | "CANCELADO";
 
export interface Emprestimo {
  id: number;
  professorNome: string;
  turmaNome: string;
  dataRetirada: Date | string; // ISO: "2026-10-07"
  dataDevolucao?: Date | string | null;
  quantidadeExemplares: number;
  status: StatusEmprestimo;
}
 
export interface ItemEmprestimo {
  id: number;
  livroTitulo: string;
  editora: string;
  quantidadeEmprestada: number;
  quantidadePerdida: number;
  quantidadeDanificada: number;
  status: StatusItemEmprestimo;
}
 
export interface EmprestimoDetalhe extends Emprestimo {
  itens: ItemEmprestimo[];
}