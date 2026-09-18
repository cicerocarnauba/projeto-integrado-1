import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { DatabaseConnection } from './database/connection.ts';
import { ProfessorDAO } from './daos/ProfessorDAO.ts';
import { ProfessorController } from './controllers/ProfessorController.ts';
import { registerProfessorHandlers } from './ipc/professorHandlers.ts';

// ⚠️ Em ESM, __dirname/__filename NÃO existem — reconstrói ANTES de usar
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
  const professorDAO = new ProfessorDAO(db);
  const professorController = new ProfessorController(professorDAO);
  registerProfessorHandlers(professorController);
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