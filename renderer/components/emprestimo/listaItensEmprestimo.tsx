import { MdOutlineReport, MdReplay } from "react-icons/md";
import {
  ItemEmprestimo,
  StatusEmprestimo,
  StatusItemEmprestimo,
} from "../../types/emprestimo";
import { calcularPendente } from "../../utils/emprestimoItem";
import { TABLE_COL_CLASSES } from "../../utils/tableLayout";
import StatusPill from "../StatusPill";

interface ListaItensEmprestimoProps {
  itens: ItemEmprestimo[];
  /** Se o empréstimo estiver cancelado, todos os itens são exibidos como cancelados. */
  statusEmprestimo?: StatusEmprestimo;
  /** Chamado ao clicar em "Devolver" de um item pendente. */
  onDevolver?: (item: ItemEmprestimo) => void;
  /** Chamado ao clicar em "Avaria" de um item pendente. */
  onRegistrarAvaria?: (item: ItemEmprestimo) => void;
}

function AvariaBadges({ item }: { item: ItemEmprestimo }) {
  const { quantidadePerdida: p, quantidadeDanificada: d } = item;

  if (!p && !d) {
    return (
      <span className="inline-flex items-center px-2.5 xl:px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300 whitespace-nowrap">
        Sem avaria
      </span>
    );
  }

  const ambos = p > 0 && d > 0;
  const badge = ambos
    ? "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] leading-tight font-semibold bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] whitespace-nowrap"
    : "inline-flex items-center px-2.5 xl:px-3 py-1 rounded-lg text-xs font-semibold bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] whitespace-nowrap";

  return (
    <div className="flex flex-col items-center gap-0.5">
      {p > 0 && <span className={badge}>{p} - Perdido</span>}
      {d > 0 && <span className={badge}>{d} - Danificado</span>}
    </div>
  );
}

export default function ListaItensEmprestimo({
  itens,
  statusEmprestimo,
  onDevolver,
  onRegistrarAvaria,
}: ListaItensEmprestimoProps) {
  const btnBase =
    "inline-flex items-center justify-center gap-1 xl:gap-1.5 w-[90px] xl:w-[96px] 2xl:w-[98px] h-8 text-xs xl:text-sm rounded-lg font-semibold shrink-0 transition-colors whitespace-nowrap";

  const btnInativo = `${btnBase} bg-gray-200 text-gray-400 cursor-not-allowed`;

  return (
    <div className="w-full bg-white border border-[#cfe5d4] rounded-2xl overflow-hidden shadow-xs">
      <table className="w-full table-fixed text-left border-collapse">
        <thead>
          <tr className="bg-[#e8f4eb] border-b border-[#c5dfca] text-xs xl:text-sm font-bold text-[#1e582d] leading-snug">
            <th className="py-2.5 xl:py-3 px-4 xl:px-5 text-left truncate">
              Título
            </th>
            <th className="py-2.5 xl:py-3 px-3 hidden 2xl:table-cell w-[16%] text-left truncate">
              Editora
            </th>
            <th
              className={`py-2.5 xl:py-3 px-2 ${TABLE_COL_CLASSES.exemplares} text-center truncate`}
            >
              Exemplares emprestados
            </th>
            <th
              className={`py-2.5 xl:py-3 px-2 ${TABLE_COL_CLASSES.statusCurto} text-center truncate`}
            >
              Status do livro
            </th>
            <th
              className={`py-2.5 xl:py-3 px-1.5 xl:px-2 ${TABLE_COL_CLASSES.avaria} text-center truncate`}
            >
              Avaria
            </th>
            <th
              className={`py-2.5 xl:py-3 px-2 ${TABLE_COL_CLASSES.acoes} text-center truncate`}
            >
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#e6f0e8]">
          {itens.map((item) => {
            const statusEfetivo: StatusItemEmprestimo =
              statusEmprestimo === "CANCELADO" ? "CANCELADO" : item.status;

            const pendente = calcularPendente(item);
            const devolvida = item.quantidadeDevolvida ?? 0;
            const perdida = item.quantidadePerdida ?? 0;
            const danificada = item.quantidadeDanificada ?? 0;

            const resumoBaixas = [
              devolvida > 0
                ? `${devolvida} ${devolvida === 1 ? "devolvido" : "devolvidos"}`
                : null,
              perdida > 0
                ? `${perdida} ${perdida === 1 ? "perdido" : "perdidos"}`
                : null,
              danificada > 0
                ? `${danificada} ${danificada === 1 ? "danificado" : "danificados"}`
                : null,
              `${pendente} ${pendente === 1 ? "pendente" : "pendentes"}`,
            ]
              .filter(Boolean)
              .join(" · ");

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
                <td className="py-2 2xl:py-2.5 px-4 xl:px-5 text-left overflow-hidden">
                  <span
                    title={item.livroTitulo}
                    className="text-sm xl:text-base font-semibold text-gray-900 block leading-snug truncate max-w-full"
                  >
                    {item.livroTitulo}
                  </span>
                  <span
                    title={item.editora}
                    className="block 2xl:hidden text-xs text-gray-600 leading-tight mt-0.5 truncate max-w-full"
                  >
                    {item.editora}
                  </span>
                </td>

                <td className="py-2 2xl:py-2.5 px-3 hidden 2xl:table-cell text-left text-sm xl:text-base font-normal text-gray-700 overflow-hidden">
                  <span
                    title={item.editora}
                    className="block leading-snug truncate max-w-full"
                  >
                    {item.editora}
                  </span>
                </td>

                <td className="py-2 2xl:py-2.5 px-2 text-center overflow-hidden">
                  <div className="inline-flex items-baseline justify-center gap-1.5">
                    <span className="w-6 text-right font-normal text-sm xl:text-base text-gray-700 tabular-nums">
                      {item.quantidadeEmprestada}
                    </span>
                    <span className="w-[78px] xl:w-[90px] text-left font-normal text-sm xl:text-base text-gray-700">
                      {item.quantidadeEmprestada === 1
                        ? "exemplar"
                        : "exemplares"}
                    </span>
                  </div>

                  {(devolvida > 0 || perdida > 0 || danificada > 0) && (
                    <span
                      title={resumoBaixas}
                      className="block text-[11px] xl:text-xs font-medium text-[#2e8b45] leading-tight mt-0.5 tabular-nums truncate max-w-full"
                    >
                      {resumoBaixas}
                    </span>
                  )}
                </td>

                <td className="py-2 2xl:py-2.5 px-2 xl:px-3 text-center">
                  <StatusPill status={statusEfetivo} />
                </td>

                <td className="py-2 2xl:py-2.5 px-1.5 xl:px-2.5 text-center">
                  <AvariaBadges item={item} />
                </td>

                <td className="py-2 2xl:py-2.5 px-2 text-center">
                  <div className="flex items-center justify-center gap-1.5 xl:gap-2 shrink-0">
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
                      disabled={devolverDesabilitado}
                      title="Registrar avaria"
                      onClick={() => onRegistrarAvaria?.(item)}
                      className={
                        devolverDesabilitado
                          ? btnInativo
                          : `${btnBase} bg-[#cf4a4a] text-white hover:bg-[#b83a3a] cursor-pointer`
                      }
                    >
                      <MdOutlineReport size={15} />
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
  );
}
