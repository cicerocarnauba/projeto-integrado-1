import { ipcMain } from 'electron';
import { EmprestimoController } from '../controllers/EmprestimoController.ts';
import type {
  ConsultarEmprestimoInput,
  RegistrarDevolucaoItemInput,
} from '../entities/ConsultaEmprestimo.ts';

export const EMPRESTIMO_CHANNELS = {
  REALIZAR: 'emprestimo:realizar',
  CONSULTAR: 'emprestimo:consultar',
  BUSCAR_POR_ID: 'emprestimo:buscarPorId',
  CANCELAR: 'emprestimo:cancelar',
  DEVOLVER_ITEM: 'emprestimo:devolverItem',
} as const;

export function registerEmprestimoHandlers(
  controller: EmprestimoController
): void {
  // Equivalente ao endpoint GET /emprestimos/{id} na arquitetura IPC.
  ipcMain.handle(EMPRESTIMO_CHANNELS.BUSCAR_POR_ID, async (_event, id: number) => {
    try {
      return { success: true, data: controller.buscarPorId(id) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Equivalente ao endpoint PATCH /emprestimos/{id}/cancelar na arquitetura IPC.
  ipcMain.handle(EMPRESTIMO_CHANNELS.CANCELAR, async (_event, id: number) => {
    try {
      return { success: true, data: controller.cancelar(id) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

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

  // Equivalente ao endpoint POST /emprestimos/{id}/itens/{itemId}/devolucao na arquitetura IPC.
  ipcMain.handle(
    EMPRESTIMO_CHANNELS.DEVOLVER_ITEM,
    async (
      _event,
      arg1: number | { emprestimoId: number; itemId: number; quantidadeDevolvida: number },
      arg2?: number,
      arg3?: RegistrarDevolucaoItemInput | number
    ) => {
      try {
        let emprestimoId: number;
        let itemId: number;
        let input: RegistrarDevolucaoItemInput | number;

        if (typeof arg1 === 'object' && arg1 !== null) {
          emprestimoId = arg1.emprestimoId;
          itemId = arg1.itemId;
          input = { quantidadeDevolvida: arg1.quantidadeDevolvida };
        } else {
          emprestimoId = arg1;
          itemId = arg2 as number;
          input = arg3 as RegistrarDevolucaoItemInput | number;
        }

        const resultado = controller.devolverItem(emprestimoId, itemId, input);
        return { success: true, data: resultado };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }
  );
}
