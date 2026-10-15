import { ipcMain } from 'electron';
import { EmprestimoController } from '../controllers/EmprestimoController.ts';

export const EMPRESTIMO_CHANNELS = {
  REALIZAR: 'emprestimo:realizar',
} as const;

export function registerEmprestimoHandlers(
  controller: EmprestimoController
): void {
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
