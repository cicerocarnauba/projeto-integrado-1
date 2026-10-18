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
