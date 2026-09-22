export interface CadastroProfessorDTO {
    nome: string;
    sobrenome: string;
    email: string;
}

export type StatusEmprestimoProf = 'nunca_fez_emprestimo' | 'tem_emprestimo_historico' | 'tem_emprestimo_atualmente'

export interface Professor extends CadastroProfessorDTO {
    id: number;
    ativo: boolean;
    statusEmprestimoProf : StatusEmprestimoProf;
}