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
          termo?: string;
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
    };
  }
}