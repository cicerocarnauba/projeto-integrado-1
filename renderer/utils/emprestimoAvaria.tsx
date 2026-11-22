

export interface InputRegistrarAvaria {
  quantidadePerdida: number;
  quantidadeDanificada: number;
}

export interface RespostaIpc<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function registrarAvaria(
  emprestimoId: number,
  itemId: number,
  input: InputRegistrarAvaria
): Promise<RespostaIpc> {
  return window.ipc.emprestimo.devolverItem(emprestimoId, itemId, {
    quantidadePerdida: input.quantidadePerdida,
    quantidadeDanificada: input.quantidadeDanificada,
  });
}