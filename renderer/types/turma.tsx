export interface CadastroTurmaDTO {
  nome: string
}

export type StatusCadastro = "ATIVO" | "INATIVO";

export interface Turma extends CadastroTurmaDTO {
  id: number;
  status: StatusCadastro;
  dataCadastro: string;
  dataAtualizacao: string;
}
