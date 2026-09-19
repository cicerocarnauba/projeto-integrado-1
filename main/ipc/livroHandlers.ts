import { ipcMain } from 'electron';
import { LivroController } from '../controllers/LivroController.ts';

export const LIVRO_CHANNELS = {
  CADASTRAR: 'livro:cadastrar',
} as const;

export function registerLivroHandlers(controller: LivroController): void {
  // RF01 — Cadastrar Livro (Equivalente ao Endpoint POST /livros)
  ipcMain.handle(LIVRO_CHANNELS.CADASTRAR, async (_event, input) => {
    try {
      const livro = controller.cadastrar(input);
      return { success: true, data: livro };
    } catch (error) {
      // RNF03 — Mensagem clara e amigável, sem exibir código técnico
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });
}
