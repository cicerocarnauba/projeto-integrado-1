export interface CadastroProfessorDTO {
  primeiroNome: string;
  sobrenome: string;
  email: string;
}

export type StatusCadastro = "ATIVO" | "INATIVO";

export interface Professor extends CadastroProfessorDTO {
  id: number;
  status?: StatusCadastro;
  dataCadastro?: string;
  dataAtualizacao?: string;
  ativo?: boolean;
  statusEmprestimoProf?: string;
}

