import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipc', {
  professor: {
    cadastrar: (input: { primeiroNome: string; sobrenome: string; email: string }) =>
      ipcRenderer.invoke('professor:cadastrar', input),
    consultar: (input?: { nome?: string; email?: string; incluirInativos?: boolean }) =>
      ipcRenderer.invoke('professor:consultar', input),
    buscarPorId: (id: number) => ipcRenderer.invoke('professor:buscarPorId', id),
    excluir: (id: number) => ipcRenderer.invoke('professor:excluir', id),
    editar: (input: { id: number; primeiroNome: string; sobrenome: string; email: string }) =>
      ipcRenderer.invoke('professor:editar', input),
    reativar: (id: number) => ipcRenderer.invoke('professor:reativar', id),
    desativar: (id: number) => ipcRenderer.invoke('professor:desativar', id),
  },
  turma: {
    cadastrar: (input: { nome: string }) => ipcRenderer.invoke('turma:cadastrar', input),
    consultar: (input?: { nome?: string; incluirInativos?: boolean }) =>
      ipcRenderer.invoke('turma:consultar', input),
    buscarPorId: (id: number) => ipcRenderer.invoke('turma:buscarPorId', id),
    ativar: (id: number) => ipcRenderer.invoke('turma:ativar', id),
    editar: (input: { id: number; nome: string }) =>
      ipcRenderer.invoke('turma:editar', input),
    desativar: (id: number) => ipcRenderer.invoke('turma:desativar', id),
    excluir: (id: number) => ipcRenderer.invoke('turma:excluir', id),
  },
  livro: {
    cadastrar: (input: { titulo: string; editora: string; quantidadeTotal: number }) =>
      ipcRenderer.invoke('livro:cadastrar', input),
    consultar: (input?: { titulo?: string; editora?: string; termo?: string; incluirInativos?: boolean }) =>
      ipcRenderer.invoke('livro:consultar', input),
    editar: (id: number, input: { titulo: string; editora: string; quantidadeTotal: number }) =>
      ipcRenderer.invoke('livro:editar', id, input),
    excluir: (id: number) => ipcRenderer.invoke('livro:excluir', id),
    desativar: (id: number) => ipcRenderer.invoke('livro:desativar', id),
    ativar: (id: number, quantidadeTotal: number) =>
      ipcRenderer.invoke('livro:ativar', id, quantidadeTotal),
  },
    emprestimo: {
    realizar: (input: {
      professorId: number;
      turmaId: number;
      itens: Array<{ livroId: number; quantidade: number }>;
    }) => ipcRenderer.invoke('emprestimo:realizar', input),
  },
});

console.log('[preload] window.ipc exposto (professor + turma + livro)');