import { MdChecklist, MdClose } from "react-icons/md";
import { Emprestimo } from "../../types/emprestimo";
import { TABLE_COL_WIDTHS } from "../../utils/tableLayout";
import StatusPill from "../StatusPill";

interface ListaEmprestimoProps {
  emprestimos: Emprestimo[];
  emprestimosComBaixas: ReadonlySet<number>;
  modo: "pendentes" | "concluidos" | "cancelados";
  onVerDetalhes?: (emprestimo: Emprestimo) => void;
  onCancelar?: (emprestimo: Emprestimo) => void;
}

export const formatarData = (iso?: string | null) =>
  iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString("pt-BR") : "—";

export default function ListaEmprestimo({
  emprestimos,
  emprestimosComBaixas,
  modo,
  onVerDetalhes,
  onCancelar,
}: ListaEmprestimoProps) {
  const historico = modo !== "pendentes";
  const cancelado = modo === "cancelados";

  return (
    <div className="w-full bg-white border border-[#cfe5d4] rounded-2xl overflow-hidden shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[860px] xl:min-w-[1320px] table-fixed text-left border-collapse">
          <colgroup>
            <col />
            <col className="hidden xl:table-column" style={{ width: "14%" }} />
            <col className="hidden xl:table-column" style={{ width: TABLE_COL_WIDTHS.dataRetirada }} />
            <col className="hidden xl:table-column" style={{ width: TABLE_COL_WIDTHS.dataDevolucao }} />
            <col style={{ width: TABLE_COL_WIDTHS.exemplares }} />
            <col style={{ width: TABLE_COL_WIDTHS.status }} />
            <col style={{ width: TABLE_COL_WIDTHS.acoes }} />
          </colgroup>
          <thead>
            <tr className="bg-[#e8f4eb] border-b border-[#c5dfca] text-[15px] font-bold text-[#1e582d] leading-snug">
              <th className="py-3 px-6 text-left whitespace-nowrap">Professor responsável</th>
              <th className="py-3 px-4 hidden xl:table-cell text-left whitespace-nowrap">Turma</th>
              <th colSpan={historico ? 1 : 2} className="py-3 px-3 hidden xl:table-cell text-center whitespace-nowrap">
                {cancelado ? "Data solicitação" : "Data retirada"}
              </th>
              {historico && (
                <th className="py-3 px-3 hidden xl:table-cell text-center whitespace-nowrap">
                  {cancelado ? "Data cancelamento" : "Data devolução"}
                </th>
              )}
              <th className="py-3 px-3 text-center whitespace-nowrap">Exemplares emprestados</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Status do empréstimo</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e6f0e8]">
            {emprestimos.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-base font-medium text-gray-500"
                >
                  {historico
                    ? "Nenhum empréstimo concluído ou cancelado."
                    : "Nenhum empréstimo pendente."}
                </td>
              </tr>
            )}

            {emprestimos.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-[#f4faf6]">
                <td className="py-2.5 px-6 text-left">
                  <span
                    title={e.professorNome}
                    className="text-[15.5px] font-semibold text-gray-900 block leading-snug truncate max-w-full"
                  >
                    {e.professorNome}
                  </span>
                  <span
                    title={e.turmaNome}
                    className="block xl:hidden text-[13px] text-gray-600 mt-0.5 truncate max-w-full"
                  >
                    {e.turmaNome} · {formatarData(e.dataRetirada instanceof Date ? e.dataRetirada.toISOString() : e.dataRetirada)}
                  </span>
                </td>
                <td className="py-2.5 px-4 hidden xl:table-cell text-[15px] font-medium text-gray-700 text-left">
                  <span
                    title={e.turmaNome}
                    className="block leading-snug truncate max-w-full"
                  >
                    {e.turmaNome}
                  </span>
                </td>
                <td
                  colSpan={historico ? 1 : 2}
                  className="py-2.5 px-3 hidden xl:table-cell text-[15px] font-medium text-gray-700 tabular-nums whitespace-nowrap text-center"
                >
                  {formatarData(
                    e.dataRetirada instanceof Date
                      ? e.dataRetirada.toISOString()
                      : e.dataRetirada
                  )}
                </td>
                {historico && (
                  <td className="py-2.5 px-3 hidden xl:table-cell text-[15px] font-medium text-gray-700 tabular-nums whitespace-nowrap text-center">
                    {formatarData(
                      e.dataDevolucao instanceof Date
                        ? e.dataDevolucao.toISOString()
                        : e.dataDevolucao
                    )}
                  </td>
                )}
                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <div className="inline-flex items-baseline justify-center gap-1.5 w-[132px]">
                    <span className="w-7 text-right font-semibold text-[15.5px] text-gray-900 tabular-nums">
                      {e.quantidadeExemplares}
                    </span>
                    <span className="w-[92px] text-left font-medium text-[15px] text-gray-700">
                      {e.quantidadeExemplares === 1 ? "exemplar" : "exemplares"}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap text-center">
                  <StatusPill status={e.status} />
                </td>
                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onVerDetalhes?.(e)}
                      className="inline-flex items-center justify-center gap-1.5 w-[104px] h-8 bg-[#389348] text-white text-[13.5px] rounded-lg font-semibold hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                    >
                      <MdChecklist size={16} />
                      Detalhes
                    </button>

                    {!historico && (
                      <button
                        type="button"
                        disabled={emprestimosComBaixas.has(e.id) || e.status !== "PENDENTE"}
                        title={
                          emprestimosComBaixas.has(e.id)
                            ? "Não é possível cancelar: já há baixas registradas neste empréstimo"
                            : e.status !== "PENDENTE"
                              ? "Apenas empréstimos pendentes podem ser cancelados"
                              : undefined
                        }
                        onClick={() => onCancelar?.(e)}
                        className={`inline-flex items-center justify-center gap-1.5 w-[104px] h-8 text-[13.5px] rounded-lg font-semibold shrink-0 transition-colors ${
                          emprestimosComBaixas.has(e.id) || e.status !== "PENDENTE"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-[#cf4a4a] text-white hover:bg-[#b83a3a] cursor-pointer"
                        }`}
                      >
                        <MdClose size={16} />
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
