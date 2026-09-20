export interface CadastroLivroDTO {
    titulo : string;
    editora : string;
    quantidadeTotal : number;
}

export interface Livro extends CadastroLivroDTO {
    id : number;
    ativo: boolean;
}