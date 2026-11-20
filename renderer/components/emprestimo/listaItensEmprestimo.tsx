import { MdOutlineReport, MdReplay } from "react-icons/md";
import {
  ItemEmprestimo,
  StatusEmprestimo,
  StatusItemEmprestimo,
} from "../../types/emprestimo";
import { calcularPendente } from "../../utils/emprestimoItem";
import { TABLE_COL_WIDTHS } from "../../utils/tableLayout";
import StatusPill from "../StatusPill";

interface ListaItensEmprestimoProps {
  itens: ItemEmprestimo[];
  /** Se o empréstimo estiver cancelado, todos os itens são exibidos como cancelados. */
  statusEmprestimo?: StatusEmprestimo;
  /** Chamado ao clicar em "Devolver" de um item pendente. */
  onDevolver?: (item: ItemEmprestimo) => void;
}

function AvariaBadges({ item }: { item: ItemEmprestimo }) {
  const { quantidadePerdida: p, quantidadeDanificada: d } = item;

  if (!p && !d) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300 whitespace-nowrap">
        Sem avaria
      </span>
    );
  }

  const badge =
    "inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] whitespace-nowrap";

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
    "inline-flex items-center justify-center gap-1.5 w-[104px] h-8 text-sm rounded-lg font-semibold shrink-0 transition-colors whitespace-nowrap";

  const btnInativo = `${btnBase} bg-gray-200 text-gray-400 cursor-not-allowed`;

  return (
    <div className="w-full bg-white border border-[#cfe5d4] rounded-2xl overflow-hidden shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] xl:min-w-[1220px] table-fixed text-left border-collapse">
          <colgroup>
            <col />
            <col className="hidden xl:table-column" style={{ width: "16%" }} />
            <col style={{ width: TABLE_COL_WIDTHS.exemplares }} />
            <col style={{ width: TABLE_COL_WIDTHS.status }} />
            <col style={{ width: TABLE_COL_WIDTHS.avaria }} />
            <col style={{ width: TABLE_COL_WIDTHS.acoes }} />
          </colgroup>
          <thead>
            <tr className="bg-[#e8f4eb] border-b border-[#c5dfca] text-sm font-bold text-[#1e582d] leading-snug">
              <th className="py-3 px-6 text-left whitespace-nowrap">Título</th>
              <th className="py-3 px-4 hidden xl:table-cell text-left whitespace-nowrap">Editora</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Exemplares emprestados</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Status do livro</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Avaria</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e6f0e8]">
            {itens.map((item) => {
              const statusEfetivo: StatusItemEmprestimo =
                statusEmprestimo === "CANCELADO" ? "CANCELADO" : item.status;

              const pendente = calcularPendente(item);
              const devolvida = item.quantidadeDevolvida ?? 0;

              const emprestimoFinalizado =
                statusEmprestimo !== undefined && statusEmprestimo !== "PENDENTE";

              const acoesDesabilitadas =
                emprestimoFinalizado || statusEfetivo !== "PENDENTE";

              const devolverDesabilitado = acoesDesabilitadas || pendente === 0;

              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[#f4faf6]"
                >
                  <td className="py-2.5 px-6 text-left">
                    <span
                      title={item.livroTitulo}
                      className="text-base font-semibold text-gray-900 block leading-snug truncate max-w-full"
                    >
                      {item.livroTitulo}
                    </span>
                    <span
                      title={item.editora}
                      className="block xl:hidden text-xs text-gray-600 mt-0.5 truncate max-w-full"
                    >
                      {item.editora}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 hidden xl:table-cell text-left text-base font-normal text-gray-700">
                    <span
                      title={item.editora}
                      className="block leading-snug truncate max-w-full"
                    >
                      {item.editora}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-baseline justify-center gap-1.5 w-[136px]">
                      <span className="w-7 text-right font-normal text-base text-gray-700 tabular-nums">
                        {item.quantidadeEmprestada}
                      </span>
                      <span className="w-[96px] text-left font-normal text-base text-gray-700">
                        {item.quantidadeEmprestada === 1
                          ? "exemplar"
                          : "exemplares"}
                      </span>
                    </div>

                    {devolvida > 0 && (
                      <span className="block text-xs font-medium text-[#2e8b45] mt-0.5 whitespace-nowrap tabular-nums">
                        {devolvida} {devolvida === 1 ? "devolvido" : "devolvidos"}
                        {" · "}
                        {pendente} {pendente === 1 ? "pendente" : "pendentes"}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <StatusPill status={statusEfetivo} />
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <AvariaBadges item={item} />
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-2 shrink-0">
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
                        <MdReplay size={16} />
                        Devolver
                      </button>

                      <button
                        type="button"
                        disabled={acoesDesabilitadas}
                        title="Registrar avaria"
                        className={
                          acoesDesabilitadas
                            ? btnInativo
                            : `${btnBase} bg-[#cf4a4a] text-white hover:bg-[#b83a3a] cursor-pointer`
                        }
                      >
                        <MdOutlineReport size={16} />
                        Avaria
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
