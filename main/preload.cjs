// main/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipc', {
  professor: {
    cadastrar: (input) => ipcRenderer.invoke('professor:cadastrar', input),
    consultar: (input) => ipcRenderer.invoke('professor:consultar', input),
    buscarPorId: (id) => ipcRenderer.invoke('professor:buscarPorId', id),
  },
});

console.log('[preload] window.ipc exposto');