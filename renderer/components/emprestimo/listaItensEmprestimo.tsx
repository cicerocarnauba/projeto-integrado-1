import { MdOutlineReport, MdReplay } from "react-icons/md";
import {
  ItemEmprestimo,
  StatusEmprestimo,
  StatusItemEmprestimo,
} from "../../types/emprestimo";
import { calcularPendente } from "../../utils/emprestimoItem";

interface ListaItensEmprestimoProps {
  itens: ItemEmprestimo[];
  /** Se o empréstimo estiver cancelado, todos os itens são exibidos como cancelados. */
  statusEmprestimo?: StatusEmprestimo;
  /** Chamado ao clicar em "Devolver" de um item pendente. */
  onDevolver?: (item: ItemEmprestimo) => void;
}

const STATUS_ITEM_STYLE: Record<
  StatusItemEmprestimo,
  { label: string; badge: string; dot: string }
> = {
  PENDENTE: {
    label: "Pendente",
    badge: "bg-[#fff4d6] text-[#b45309] border-[#fde3a1]",
    dot: "bg-[#f59e0b]",
  },
  CONCLUIDO: {
    label: "Concluído",
    badge: "bg-[#d8f3dc] text-[#1e582d] border-[#c1e7c9]",
    dot: "bg-[#2e8b45]",
  },
  CANCELADO: {
    label: "Cancelado",
    badge: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]",
    dot: "bg-[#dc2626]",
  },
};

function AvariaBadges({ item }: { item: ItemEmprestimo }) {
  const { quantidadePerdida: p, quantidadeDanificada: d } = item;

  if (!p && !d) {
    return (
      <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
        Sem avaria
      </span>
    );
  }

  const badge =
    "px-3 py-1 rounded-lg text-xs font-medium bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]";

  return (
    <div className="flex flex-col items-center gap-1">
      {p > 0 && <span className={badge}>{p} - Perdido</span>}
      {d > 0 && <span className={badge}>{d} - Danificado</span>}
    </div>
  );
}

export default function ListaItensEmprestimo({
  itens,
  statusEmprestimo,
  onDevolver,
}: ListaItensEmprestimoProps) {
  const btnBase =
    "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium shrink-0 transition-colors";

  const btnInativo = `${btnBase} bg-gray-200 text-gray-400 cursor-not-allowed`;

  return (
    <div className="w-full bg-white border border-[#D3E8D6] rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#ebf5ed] border-b border-[#c8decb] text-sm font-semibold text-[#23582c]">
              <th className="py-3.5 px-4 sm:px-6">Título</th>
              <th className="py-3.5 px-3 hidden md:table-cell">Editora</th>
              <th className="py-3.5 px-3 text-center">
                Exemplares emprestados
              </th>
              <th className="py-3.5 px-3 text-center">Status do livro</th>
              <th className="py-3.5 px-3 text-center">Avaria</th>
              <th className="py-3.5 px-4 text-center w-[270px]">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E6F0E8]">
            {itens.map((item) => {
              const statusEfetivo: StatusItemEmprestimo =
                statusEmprestimo === "CANCELADO" ? "CANCELADO" : item.status;

              const estilo =
                STATUS_ITEM_STYLE[statusEfetivo] ?? STATUS_ITEM_STYLE.PENDENTE;

              const pendente = calcularPendente(item);
              const devolvida = item.quantidadeDevolvida ?? 0;

              // Só itens pendentes podem ser devolvidos / ter avaria registrada
              const emprestimoFinalizado = statusEmprestimo !== undefined && statusEmprestimo !== "PENDENTE";

              const acoesDesabilitadas = emprestimoFinalizado || statusEfetivo !== "PENDENTE";

              // Devolver também fica bloqueado se não sobrou nada pendente
              const devolverDesabilitado = acoesDesabilitadas || pendente === 0;

              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[#f6fbf7]"
                >
                  <td className="py-3 px-4 sm:px-6 text-sm font-medium text-gray-900 max-w-[200px]">
                    {item.livroTitulo}
                  </td>

                  <td className="py-3 px-3 hidden md:table-cell text-sm text-gray-700">
                    {item.editora}
                  </td>

                  <td className="py-3 px-3 text-center text-sm font-medium text-gray-900">
                    {item.quantidadeEmprestada}{" "}
                    {item.quantidadeEmprestada === 1
                      ? "exemplar"
                      : "exemplares"}

                    {/* Aparece quando já houve devolução (parcial ou total) */}
                    {devolvida > 0 && (
                      <span className="block text-xs font-normal text-[#5AA365] mt-0.5">
                        {devolvida} {devolvida === 1 ? "devolvido" : "devolvidos"}
                        {" · "}
                        {pendente} {pendente === 1 ? "pendente" : "pendentes"}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs border ${estilo.badge}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${estilo.dot}`} />
                      {estilo.label}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <AvariaBadges item={item} />
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={devolverDesabilitado}
                        onClick={() => onDevolver?.(item)}
                        className={
                          devolverDesabilitado
                            ? btnInativo
                            : `${btnBase} bg-[#389348] text-white hover:bg-[#2e7d3d] cursor-pointer`
                        }
                      >
                        <MdReplay size={15} />
                        Devolver
                      </button>

                      <button
                        type="button"
                        disabled={acoesDesabilitadas}
                        className={
                          acoesDesabilitadas
                            ? btnInativo
                            : `${btnBase} bg-[#dc3b3b] text-white cursor-pointer`
                        }
                      >
                        <MdOutlineReport size={15} />
                        Registrar avaria
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
