import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipc', {
  professor: {
    cadastrar: (input: { primeiroNome: string; sobrenome: string; email: string }) =>
      ipcRenderer.invoke('professor:cadastrar', input),
    consultar: (input?: { nome?: string; email?: string; incluirInativos?: boolean }) =>
      ipcRenderer.invoke('professor:consultar', input),
    buscarPorId: (id: number) => ipcRenderer.invoke('professor:buscarPorId', id),
  },
  turma: {
    cadastrar: (input: { nome: string }) => ipcRenderer.invoke('turma:cadastrar', input),
    consultar: (input?: { nome?: string; incluirInativos?: boolean }) =>
      ipcRenderer.invoke('turma:consultar', input),
    buscarPorId: (id: number) => ipcRenderer.invoke('turma:buscarPorId', id),
  },
  livro: {
    cadastrar: (input: { titulo: string; editora: string; quantidadeTotal: number }) =>
      ipcRenderer.invoke('livro:cadastrar', input),
    consultar: (input?: { titulo?: string; editora?: string; termo?: string; incluirInativos?: boolean }) =>
      ipcRenderer.invoke('livro:consultar', input),
  },
});

console.log('[preload] window.ipc exposto (professor + turma + livro)');
