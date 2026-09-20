// main/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipc', {
  professor: {
    cadastrar: (input) => ipcRenderer.invoke('professor:cadastrar', input),
    consultar: (input) => ipcRenderer.invoke('professor:consultar', input),
    buscarPorId: (id) => ipcRenderer.invoke('professor:buscarPorId', id),
  },
  turma: {
    cadastrar: (input) => ipcRenderer.invoke('turma:cadastrar', input),
    consultar: (input) => ipcRenderer.invoke('turma:consultar', input),
    buscarPorId: (id) => ipcRenderer.invoke('turma:buscarPorId', id),
  },
  livro: {
    cadastrar: (input) => ipcRenderer.invoke('livro:cadastrar', input),
    consultar: (input) => ipcRenderer.invoke('livro:consultar', input),
  },
});

console.log('[preload] window.ipc exposto (professor + turma + livro)');