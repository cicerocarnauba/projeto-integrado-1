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

  /**
   * Registra a devolução total ou parcial, incluindo perdas e avarias (HU22.3).
   * Regras:
   * - As quantidades devem ser inteiros não negativos, com pelo menos uma baixa.
   * - A soma das quantidades não pode exceder a quantidade ainda pendente do item
   *   (considerando cópias retiradas menos devoluções, perdas e avarias já computadas).
   */
  public devolver(
    quantidade: number,
    quantidadePerdida: number = 0,
    quantidadeDanificada: number = 0
  ): void {
    if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
      throw new Error('A quantidade devolvida deve ser um número inteiro maior que zero.');
    }

    if (!Number.isSafeInteger(quantidadePerdida) || quantidadePerdida < 0) {
      throw new Error('A quantidade perdida deve ser um número inteiro maior ou igual a zero.');
    }
    if (!Number.isSafeInteger(quantidadeDanificada) || quantidadeDanificada < 0) {
      throw new Error('A quantidade danificada deve ser um número inteiro maior ou igual a zero.');
    }

    const totalBaixado = quantidade + quantidadePerdida + quantidadeDanificada;
    if (totalBaixado === 0) {
      throw new Error('A quantidade devolvida deve ser um número inteiro maior que zero. Informe pelo menos um exemplar devolvido, perdido ou danificado.');
    }

    const pendente = this.getQuantidadePendente();
    if (totalBaixado > pendente) {
      if (quantidadePerdida > 0 || quantidadeDanificada > 0) {
        throw new Error(
          `A soma das quantidades devolvida, perdida e danificada (${totalBaixado}) não pode ser maior que a quantidade pendente (${pendente}).`
        );
      }
      throw new Error(
        `A quantidade devolvida (${quantidade}) não pode ser maior que a quantidade pendente (${pendente}).`
      );
    }

    this.quantidadeDevolvida += quantidade;
    this.quantidadePerdida += quantidadePerdida;
    this.quantidadeDanificada += quantidadeDanificada;
  }
}
