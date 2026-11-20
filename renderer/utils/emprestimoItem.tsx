import { ItemEmprestimo } from "../types/emprestimo";

/**
 * Quantidade de exemplares do item que ainda estão pendentes:
 * retirada - (devolvida + perdida + danificada).
 *
 * Fica num lugar só para a tabela, o modal e o contador do rodapé
 * usarem sempre a mesma regra.
 */
export function calcularPendente(item: ItemEmprestimo): number {
  const baixado =
    (item.quantidadeDevolvida ?? 0) +
    (item.quantidadePerdida ?? 0) +
    (item.quantidadeDanificada ?? 0);

  return Math.max(0, item.quantidadeEmprestada - baixado);
}