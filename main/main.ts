import path from 'path';
import fs from 'fs';
import { app, nativeImage } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { DatabaseConnection } from './database/connection';
import { ProfessorDAO } from './daos/ProfessorDAO';
import { ProfessorController } from './controllers/ProfessorController';
import { registerProfessorHandlers } from './ipc/professorHandlers';
import { TurmaDAO } from './daos/TurmaDAO';
import { TurmaController } from './controllers/TurmaController';
import { registerTurmaHandlers } from './ipc/turmaHandlers';
import { LivroDAO } from './daos/LivroDAO';
import { LivroController } from './controllers/LivroController';
import { registerLivroHandlers } from './ipc/livroHandlers';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('appData')} (development)`);
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

  // Livro
  const livroDAO = new LivroDAO(db);
  const livroController = new LivroController(livroDAO);
  registerLivroHandlers(livroController);
}

function resolvePreloadPath(): string {
  const candidates = [
    path.join(__dirname, 'preload.js'),
    path.join(__dirname, 'preload.cjs'),
    path.join(__dirname, '../main/preload.cjs'),
    path.join(process.cwd(), 'main/preload.cjs'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

function resolveIcon(): Electron.NativeImage | null {
  const candidates = [
    path.join(__dirname, 'icon.png'),
    path.join(process.cwd(), 'resources/icon.png'),
    path.join(__dirname, '../resources/icon.png'),
    path.join(process.cwd(), 'renderer/public/icon.png'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      const img = nativeImage.createFromPath(c);
      if (!img.isEmpty()) return img;
    }
  }
  return null;
}

;(async () => {
  await app.whenReady();

  bootstrapBackend();

  const preloadPath = resolvePreloadPath();
  const icon = resolveIcon();

  const mainWindow = createWindow('main', {
    width: 1200,
    height: 800,
    icon: icon ?? undefined,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (icon) {
    mainWindow.setIcon(icon);
  }

  if (isProd) {
    await mainWindow.loadURL('app://./index.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
