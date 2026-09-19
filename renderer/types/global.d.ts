export {};

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
      };
    };
  }
}