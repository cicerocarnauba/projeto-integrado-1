export interface CadastroLivroDTO {
    titulo : string;
    editora : string;
    quantidadeTotal : number;
}

export type StatusEmprestimo = 'nunca_emprestado' | 'emprestado_e_devolvido' | 'emprestado_atualmente'

export interface Livro extends CadastroLivroDTO {
    id : number;
    ativo: boolean;
    statusEmprestimo: StatusEmprestimo;
}