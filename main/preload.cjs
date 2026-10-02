// main/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipc', {
  professor: {
    cadastrar: (input) => ipcRenderer.invoke('professor:cadastrar', input),
    consultar: (input) => ipcRenderer.invoke('professor:consultar', input),
    buscarPorId: (id) => ipcRenderer.invoke('professor:buscarPorId', id),
    excluir: (id) => ipcRenderer.invoke('professor:excluir', id),
    editar: (input) => ipcRenderer.invoke('professor:editar', input),
    reativar: (id) => ipcRenderer.invoke('professor:reativar', id),
    desativar: (id) => ipcRenderer.invoke('professor:desativar', id),
  },
  turma: {
    cadastrar: (input) => ipcRenderer.invoke('turma:cadastrar', input),
    consultar: (input) => ipcRenderer.invoke('turma:consultar', input),
    buscarPorId: (id) => ipcRenderer.invoke('turma:buscarPorId', id),
    ativar: (id) => ipcRenderer.invoke('turma:ativar', id),
    editar: (input) => ipcRenderer.invoke('turma:editar', input),
  },
  livro: {
    cadastrar: (input) => ipcRenderer.invoke('livro:cadastrar', input),
    consultar: (input) => ipcRenderer.invoke('livro:consultar', input),
  },
});

console.log('[preload] window.ipc exposto (professor + turma + livro)');