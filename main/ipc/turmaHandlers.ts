import { ipcMain } from 'electron';
import { TurmaController } from '../controllers/TurmaController.ts';

export const TURMA_CHANNELS = {
  CADASTRAR: 'turma:cadastrar',
  CONSULTAR: 'turma:consultar',
  BUSCAR_POR_ID: 'turma:buscarPorId',
} as const;

export function registerTurmaHandlers(controller: TurmaController): void {
  // RF12 — Cadastrar Turma
  ipcMain.handle(TURMA_CHANNELS.CADASTRAR, async (_event, input) => {
    try {
      const turma = controller.cadastrar(input);
      return { success: true, data: turma };
    } catch (error) {
      // RNF03 — Mensagem clara, sem código técnico
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // RF13 — Consultar Turma
  ipcMain.handle(TURMA_CHANNELS.CONSULTAR, async (_event, input) => {
    try {
      const filtro = input ?? {};

      const turmas = controller.consultar({
        nome: typeof filtro.nome === 'string' ? filtro.nome : undefined,
        incluirInativos: Boolean(filtro.incluirInativos),
      });

      return { success: true, data: turmas };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // Apoio — Buscar por ID
  ipcMain.handle(TURMA_CHANNELS.BUSCAR_POR_ID, async (_event, id: number) => {
    try {
      const turma = controller.buscarPorId(id);
      return { success: true, data: turma };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}