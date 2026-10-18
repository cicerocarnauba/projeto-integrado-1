import { ipcMain } from 'electron';
import { EmprestimoController } from '../controllers/EmprestimoController.ts';
import type { ConsultarEmprestimoInput } from '../entities/ConsultaEmprestimo.ts';

export const EMPRESTIMO_CHANNELS = {
  REALIZAR: 'emprestimo:realizar',
  CONSULTAR: 'emprestimo:consultar',
} as const;

export function registerEmprestimoHandlers(
  controller: EmprestimoController
): void {
  // Equivalente ao endpoint GET /emprestimos na arquitetura IPC do aplicativo.
  ipcMain.handle(EMPRESTIMO_CHANNELS.CONSULTAR, async (_event, input?: ConsultarEmprestimoInput) => {
    try {
      return { success: true, data: controller.consultar(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // HU19 — Realizar Empréstimo (Equivalente ao Endpoint POST /emprestimos)
  ipcMain.handle(EMPRESTIMO_CHANNELS.REALIZAR, async (_event, input: any) => {
    try {
      const emprestimo = controller.realizar(input);
      return {
        success: true,
        data: emprestimo,
      };
    } catch (error) {
      // RNF03 — Mensagem clara e amigável, sem exibir código técnico
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });
}
