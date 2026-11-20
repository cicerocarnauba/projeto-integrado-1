import { ipcMain } from 'electron';
import { TurmaController } from '../controllers/TurmaController.ts';

export const TURMA_CHANNELS = {
  CADASTRAR: 'turma:cadastrar',
  CONSULTAR: 'turma:consultar',
  BUSCAR_POR_ID: 'turma:buscarPorId',
  ATIVAR: 'turma:ativar',
  EDITAR: 'turma:editar',
  DESATIVAR: 'turma:desativar',
  EXCLUIR: 'turma:excluir',
} as const;

export function registerTurmaHandlers(controller: TurmaController): void {
  // RF12 — Cadastrar Turma
  ipcMain.handle(TURMA_CHANNELS.CADASTRAR, async (_event, input) => {
    try {
      const turma = controller.cadastrar(input);
      return { success: true, data: turma };
    } catch (error) {
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
        incluirInativos:
          typeof filtro.incluirInativos === 'boolean' ? filtro.incluirInativos : undefined,
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

  // HU18 — Ativar Turma
  ipcMain.handle(TURMA_CHANNELS.ATIVAR, async (_event, id: number) => {
    try {
      const turma = controller.ativar(id);
      return { success: true, data: turma };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // HU14 — Editar Turma
  ipcMain.handle(TURMA_CHANNELS.EDITAR, async (_event, payload) => {
    try {
      const id = Number(payload?.id);
      if (!id || Number.isNaN(id)) {
        throw new Error('ID da turma inválido.');
      }
      const turma = controller.editar(id, {
        nome: payload?.nome,
      });
      return { success: true, data: turma };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // HU17 — Desativar Turma
  ipcMain.handle(TURMA_CHANNELS.DESATIVAR, async (_event, id: number) => {
    try {
      const turma = controller.desativar(id);
      return { success: true, data: turma };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // HU16 — Excluir Turma
  ipcMain.handle(TURMA_CHANNELS.EXCLUIR, async (_event, id: number) => {
    try {
      const resultado = controller.excluir(id);
      return { success: true, data: resultado };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });
}