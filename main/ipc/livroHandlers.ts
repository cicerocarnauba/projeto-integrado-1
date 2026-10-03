import { ipcMain } from 'electron';
import { LivroController } from '../controllers/LivroController.ts';

export const LIVRO_CHANNELS = {
  CADASTRAR: 'livro:cadastrar',
  CONSULTAR: 'livro:consultar',
  EDITAR: 'livro:editar',
  EXCLUIR: 'livro:excluir',
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

  // RF04 — Consultar Livro (Equivalente ao Endpoint GET /livros)
  ipcMain.handle(LIVRO_CHANNELS.CONSULTAR, async (_event, input) => {
    try {
      const filtro = input ?? {};
      const livros = controller.consultar({
        titulo: typeof filtro.titulo === 'string' ? filtro.titulo : undefined,
        editora: typeof filtro.editora === 'string' ? filtro.editora : undefined,
        termo: typeof filtro.termo === 'string' ? filtro.termo : undefined,
        incluirInativos: Boolean(filtro.incluirInativos),
      });
      return { success: true, data: livros };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // RF02 — Editar Livro (Equivalente ao Endpoint PUT /livros/{id})
  ipcMain.handle(LIVRO_CHANNELS.EDITAR, async (_event, idOrInput: any, maybeInput?: any) => {
    try {
      const input =
        maybeInput !== undefined
          ? { id: Number(idOrInput), ...maybeInput }
          : idOrInput;

      const livroAtualizado = controller.editar({
        id: Number(input.id),
        titulo: input.titulo,
        editora: input.editora,
        quantidadeTotal: Number(input.quantidadeTotal),
      });

      return { success: true, data: livroAtualizado };
    } catch (error) {
      // RNF03 — Mensagem clara e amigável, sem exibir código técnico
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // RF03 — Excluir Livro (Equivalente ao Endpoint DELETE /livros/{id})
  ipcMain.handle(LIVRO_CHANNELS.EXCLUIR, async (_event, id: any) => {
    try {
      const resultado = controller.excluir(Number(id));
      return { success: true, data: resultado };
    } catch (error) {
      // RNF03 — Mensagem clara e amigável, sem exibir código técnico
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });
}