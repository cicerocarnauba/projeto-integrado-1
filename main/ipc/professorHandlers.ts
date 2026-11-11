import { ipcMain } from 'electron';
import { ProfessorController } from '../controllers/ProfessorController.ts';

export const PROFESSOR_CHANNELS = {
  CADASTRAR: 'professor:cadastrar',
  CONSULTAR: 'professor:consultar',
  BUSCAR_POR_ID: 'professor:buscarPorId',
  EXCLUIR: 'professor:excluir',
  EDITAR: 'professor:editar',
  REATIVAR: 'professor:reativar',
  DESATIVAR: 'professor:desativar',
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
      return { success: false, error: (error as Error).message };
    }
  });

  // RF09 — Consultar Professor (retorna possuiHistorico em cada item)
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
      return { success: false, error: (error as Error).message };
    }
  });

  // Apoio — Buscar por ID (retorna possuiHistorico)
  ipcMain.handle(PROFESSOR_CHANNELS.BUSCAR_POR_ID, async (_event, id: number) => {
    try {
      const professor = controller.buscarPorId(Number(id));
      return { success: true, data: professor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // HU10 — Excluir Professor
  ipcMain.handle(PROFESSOR_CHANNELS.EXCLUIR, async (_event, id: number) => {
    try {
      const resultado = controller.excluir(Number(id));
      return { success: true, data: resultado };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // HU08 — Editar Professor
  ipcMain.handle(PROFESSOR_CHANNELS.EDITAR, async (_event, payload) => {
    try {
      const id = Number(payload?.id);
      if (!id || Number.isNaN(id)) {
        throw new Error('ID do professor inválido.');
      }
      const professor = controller.editar(id, {
        primeiroNome: payload?.primeiroNome,
        sobrenome: payload?.sobrenome,
        email: payload?.email,
      });
      return { success: true, data: professor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // HU12 — Reativar Professor
  ipcMain.handle(PROFESSOR_CHANNELS.REATIVAR, async (_event, id: number) => {
    try {
      const professor = controller.reativar(Number(id));
      return { success: true, data: professor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // HU11 — Desativar Professor  ← handler que estava FALTANDO
  ipcMain.handle(PROFESSOR_CHANNELS.DESATIVAR, async (_event, id: number) => {
    try {
      const professor = controller.desativar(Number(id));
      return { success: true, data: professor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}