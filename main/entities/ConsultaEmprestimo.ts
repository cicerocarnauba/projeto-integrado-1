import type { StatusEmprestimo } from './Emprestimo.ts';

/**
 * Filtros de window.ipc.emprestimo.consultar(input).
 * Todos são opcionais: consultar() e consultar({}) retornam todos os itens dos três status.
 * Qualquer filtro pode ser usado sozinho. Quando combinados, todos precisam corresponder (AND).
 * Cadastros inativos também são considerados, sem precisar de um parâmetro incluirInativos.
 * Para não aplicar um filtro, omita o campo ou use undefined; não envie null ou string vazia.
 */
export interface ConsultarEmprestimoInput {
  /** ID numérico inteiro positivo do professor, inclusive inativo. Não recebe nome ou e-mail. */
  professorId?: number;
  /** ID numérico inteiro positivo da turma, inclusive inativa. Não recebe o nome da turma. */
  turmaId?: number;
  /** ID numérico inteiro positivo do livro, inclusive inativo. Retorna apenas itens desse livro. */
  livroId?: number;
  /** Status do empréstimo: 'PENDENTE', 'CONCLUIDO' ou 'CANCELADO', exatamente assim. */
  status?: StatusEmprestimo;
}

/** Uma linha por item de empréstimo, inclusive no histórico de cadastros inativos. */
export interface ItemEmprestimoConsultaDTO {
  /** ID do item de empréstimo; um mesmo emprestimoId pode ter vários itens. */
  id: number;
  /** ID do empréstimo ao qual este item pertence. */
  emprestimoId: number;
  professorId: number;
  professorNome: string;
  turmaId: number;
  turmaNome: string;
  livroId: number;
  livroTitulo: string;
  dataRetirada: Date;
  status: StatusEmprestimo;
  quantidadeRetirada: number;
  quantidadeDevolvida: number;
  quantidadePerdida: number;
  quantidadeDanificada: number;
}

export type StatusItemEmprestimo = 'PENDENTE' | 'CONCLUIDO';

/**
 * Item de empréstimo detalhado com metadados do livro (título, editora, quantidade).
 * Fornece aliases compatíveis com as convenções do frontend (livroTitulo, titulo, quantidadeExemplar, etc).
 */
export interface ItemEmprestimoDetalheDTO {
  id: number;
  livroId: number;
  livroTitulo: string;
  titulo: string;
  editora: string;
  quantidadeExemplar: number;
  quantidadeEmprestada: number;
  quantidadeRetirada: number;
  quantidadeDevolvida: number;
  quantidadePerdida: number;
  quantidadeDanificada: number;
  status: StatusItemEmprestimo;
}

/**
 * DTO completo de retorno da busca por ID do empréstimo.
 * Retorna os dados gerais (professor, turma, datas, status) e a lista agrupada de itens com detalhes dos livros.
 */
export interface EmprestimoDetalhesDTO {
  id: number;
  professorId: number;
  professorNome: string;
  turmaId: number;
  turmaNome: string;
  dataRetirada: Date;
  dataDevolucao: Date | null;
  quantidadeExemplares: number;
  status: StatusEmprestimo;
  itens: ItemEmprestimoDetalheDTO[];
}
