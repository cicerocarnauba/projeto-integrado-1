export type StatusEmprestimo = "PENDENTE" | "CONCLUIDO" | "CANCELADO";
export type StatusItemEmprestimo = "PENDENTE" | "CONCLUIDO";
 
export interface Emprestimo {
  id: number;
  professorNome: string;
  turmaNome: string;
  dataRetirada: string; // ISO: "2026-10-07"
  dataDevolucao?: string | null;
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
 