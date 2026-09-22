export interface CadastroLivroDTO {
  titulo: string;
  editora: string;
  quantidadeTotal: number;
}

export type StatusLivro = 'ATIVO' | 'INATIVO';
export type StatusEmprestimo = 'nunca_emprestado' | 'emprestado_e_devolvido' | 'emprestado_atualmente';

export interface Livro extends CadastroLivroDTO {
  id: number;
  quantidadeEmprestada: number;
  saldoDisponivel: number;
  status: StatusLivro;
  dataCadastro?: Date | string;
  dataAtualizacao?: Date | string;
  

//   ativo?: boolean;
//   statusEmprestimo?: StatusEmprestimo;
}