import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { DatabaseConnection } from './database/connection.ts';
import { ProfessorDAO } from './daos/ProfessorDAO.ts';
import { TurmaDAO } from './daos/TurmaDAO.ts';
import { ProfessorController } from './controllers/ProfessorController.ts';
import { TurmaController } from './controllers/TurmaController.ts';
import { registerProfessorHandlers } from './ipc/professorHandlers.ts';
import { registerTurmaHandlers } from './ipc/turmaHandlers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const preloadPath = path.join(__dirname, 'preload.cjs');
console.log('[main] __dirname:', __dirname);
console.log('[main] preload path:', preloadPath);
console.log('[main] preload existe?', fs.existsSync(preloadPath));

let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await mainWindow.loadURL('http://localhost:8888');
  mainWindow.webContents.openDevTools();
}

function bootstrapBackend(): void {
  const db = DatabaseConnection.getInstance();

  // Professor
  const professorDAO = new ProfessorDAO(db);
  const professorController = new ProfessorController(professorDAO);
  registerProfessorHandlers(professorController);

  // Turma
  const turmaDAO = new TurmaDAO(db);
  const turmaController = new TurmaController(turmaDAO);
  registerTurmaHandlers(turmaController);
}

app.whenReady().then(async () => {
  bootstrapBackend();
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});