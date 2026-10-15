import type {
  ConsultarEmprestimoInput,
  ItemEmprestimoConsultaDTO,
} from '../../main/entities/ConsultaEmprestimo';

declare global {
  interface Window {
    ipc: {
      professor: {
        cadastrar: (input: {
          primeiroNome: string;
          sobrenome: string;
          email: string;
        }) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        consultar: (input?: {
          nome?: string;
          email?: string;
          incluirInativos?: boolean;
        }) => Promise<{
          success: boolean;
          data?: any[];
          error?: string;
        }>;

        buscarPorId: (id: number) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        excluir: (id: number) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        editar: (input: {
          id: number;
          primeiroNome: string;
          sobrenome: string;
          email: string;
        }) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        reativar: (id: number) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        desativar: (id: number) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;
      };

      turma: {
        cadastrar: (input: {
          nome: string;
        }) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        consultar: (input?: {
          nome?: string;
          incluirInativos?: boolean;
        }) => Promise<{
          success: boolean;
          data?: any[];
          error?: string;
        }>;

        buscarPorId: (id: number) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        ativar: (id: number) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        editar: (input: {
          id: number;
          nome: string;
        }) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        desativar: (id: number) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        excluir: (id: number) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;
      };

      livro: {
        cadastrar: (input: {
          titulo: string;
          editora: string;
          quantidadeTotal: number;
        }) => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;

        consultar: (input?: {
          titulo?: string;
          editora?: string;
          termo?: string;
          incluirInativos?: boolean;
        }) => Promise<{
          success: boolean;
          data?: Array<{
            id: number | null;
            titulo: string;
            editora: string;
            quantidadeTotal: number;
            quantidadeEmprestada: number;
            saldoDisponivel: number;
            status: 'ATIVO' | 'INATIVO';
            dataCadastro: Date;
            dataAtualizacao: Date;
          }>;
          error?: string;
        }>;

        editar: (
          id: number,
          input: {
            titulo: string;
            editora: string;
            quantidadeTotal: number;
          }
        ) => Promise<{
          success: boolean;
          data?: {
            id: number | null;
            titulo: string;
            editora: string;
            quantidadeTotal: number;
            quantidadeEmprestada: number;
            saldoDisponivel: number;
            status: 'ATIVO' | 'INATIVO';
            dataCadastro: Date;
            dataAtualizacao: Date;
          };
          error?: string;
        }>;

        excluir: (id: number) => Promise<{
          success: boolean;
          data?: {
            acao: 'EXCLUIDO' | 'DESATIVADO';
            mensagem: string;
            id: number;
            livro?: {
              id: number | null;
              titulo: string;
              editora: string;
              quantidadeTotal: number;
              quantidadeEmprestada: number;
              saldoDisponivel: number;
              status: 'ATIVO' | 'INATIVO';
              dataCadastro: Date;
              dataAtualizacao: Date;
            };
          };
          error?: string;
        }>;

        desativar: (id: number) => Promise<{
          success: boolean;
          data?: {
            mensagem: string;
            livro: {
              id: number | null;
              titulo: string;
              editora: string;
              quantidadeTotal: number;
              quantidadeEmprestada: number;
              saldoDisponivel: number;
              status: 'ATIVO' | 'INATIVO';
              dataCadastro: Date;
              dataAtualizacao: Date;
            };
          };
          error?: string;
        }>;

        ativar: (
          id: number,
          quantidadeTotal: number
        ) => Promise<{
          success: boolean;
          data?: {
            mensagem: string;
            livro: {
              id: number | null;
              titulo: string;
              editora: string;
              quantidadeTotal: number;
              quantidadeEmprestada: number;
              saldoDisponivel: number;
              status: 'ATIVO' | 'INATIVO';
              dataCadastro: Date;
              dataAtualizacao: Date;
            };
          };
          error?: string;
        }>;
      };

      emprestimo: {
        /**
         * Consulta uma linha por item de empréstimo, incluindo cadastros associados inativos.
         * @param input Filtros opcionais: professorId, turmaId e livroId são IDs numéricos
         * inteiros positivos; status aceita 'PENDENTE', 'CONCLUIDO' ou 'CANCELADO'.
         * Use qualquer filtro sozinho ou combine vários: todos devem corresponder (AND).
         * Omita os campos sem filtro; não envie null, string vazia ou IDs como texto.
         * @returns Em sucesso: { success: true, data: [...] }; sem resultados, data é [].
         * Em falha: { success: false, error: 'Mensagem' }. Confira success antes de usar data.
         * @example
         * // Sem parâmetros: todos os itens, independentemente do status.
         * await window.ipc.emprestimo.consultar();
         * @example
         * // Somente o status; nenhum outro filtro é obrigatório.
         * await window.ipc.emprestimo.consultar({ status: 'PENDENTE' });
         * @example
         * // Filtros combinados. Substitua os IDs pelos existentes no banco.
         * await window.ipc.emprestimo.consultar({
         *   professorId: 1, turmaId: 2, livroId: 3, status: 'CONCLUIDO'
         * });
         */
        consultar: (input?: ConsultarEmprestimoInput) => Promise<{
          success: boolean;
          data?: ItemEmprestimoConsultaDTO[];
          error?: string;
        }>;

        realizar: (input: {
          professorId: number;
          turmaId: number;
          itens: Array<{ livroId: number; quantidade: number }>;
        }) => Promise<{
          success: boolean;
          data?: {
            id: number | null;
            professorId: number;
            turmaId: number;
            dataRetirada: Date;
            status: 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO';
            itens: Array<{
              id: number | null;
              emprestimoId: number | null;
              livroId: number;
              quantidadeRetirada: number;
              quantidadeDevolvida: number;
              quantidadePerdida: number;
              quantidadeDanificada: number;
            }>;
          };
          error?: string;
        }>;
      };
    };
  }
}
