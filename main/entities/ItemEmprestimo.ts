// ItemEmprestimo — representa um livro retirado em um empréstimo.
// Guarda a quantidade retirada e a quantidade já devolvida/perdida/danificada.
// Information Expert: sabe calcular seu próprio saldo pendente.
export class ItemEmprestimo {
  id: number | null;
  emprestimoId: number | null;
  livroId: number;
  quantidadeRetirada: number;
  quantidadeDevolvida: number;
  quantidadePerdida: number;
  quantidadeDanificada: number;

  constructor(props: {
    id?: number | null;
    emprestimoId?: number | null;
    livroId: number;
    quantidadeRetirada: number;
    quantidadeDevolvida?: number;
    quantidadePerdida?: number;
    quantidadeDanificada?: number;
  }) {
    this.id = props.id ?? null;
    this.emprestimoId = props.emprestimoId ?? null;
    this.livroId = props.livroId;
    this.quantidadeRetirada = props.quantidadeRetirada;
    this.quantidadeDevolvida = props.quantidadeDevolvida ?? 0;
    this.quantidadePerdida = props.quantidadePerdida ?? 0;
    this.quantidadeDanificada = props.quantidadeDanificada ?? 0;
  }

  // Quantidade ainda pendente (não devolvida, nem perdida, nem danificada)
  public getQuantidadePendente(): number {
    return (
      this.quantidadeRetirada -
      this.quantidadeDevolvida -
      this.quantidadePerdida -
      this.quantidadeDanificada
    );
  }

  // Se todas as cópias deste item já foram baixadas
  public isTotalmenteBaixado(): boolean {
    return this.getQuantidadePendente() === 0;
  }
}