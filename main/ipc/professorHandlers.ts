import { ipcMain } from 'electron';
import { ProfessorController } from '../controllers/ProfessorController.ts';

export const PROFESSOR_CHANNELS = {
  CADASTRAR: 'professor:cadastrar',
  CONSULTAR: 'professor:consultar',
  BUSCAR_POR_ID: 'professor:buscarPorId',
} as const;

export function registerProfessorHandlers(
  controller: ProfessorController
): void {
  // RF07 — Cadastrar Professor
  ipcMain.handle(PROFESSOR_CHANNELS.CADASTRAR, async (_event, input) => {
    try {
      const professor = controller.cadastrar(input);
      return { success: true, data: professor };
    } catch (error) {
      // RNF03 — Mensagem clara, sem código técnico
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // RF09 — Consultar Professor (filtros: nome, email, incluirInativos)
  ipcMain.handle(PROFESSOR_CHANNELS.CONSULTAR, async (_event, input) => {
    try {
      const filtro = input ?? {};

      const professores = controller.consultar({
        nome: typeof filtro.nome === 'string' ? filtro.nome : undefined,
        email: typeof filtro.email === 'string' ? filtro.email : undefined,
        incluirInativos: Boolean(filtro.incluirInativos),
      });

      return { success: true, data: professores };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // Apoio — Buscar por ID
  ipcMain.handle(PROFESSOR_CHANNELS.BUSCAR_POR_ID, async (_event, id: number) => {
    try {
      const professor = controller.buscarPorId(id);
      return { success: true, data: professor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}