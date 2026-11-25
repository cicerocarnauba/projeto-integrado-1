import { MdEdit } from "react-icons/md";
import { Livro } from "../../types/livro";
import { TABLE_COL_CLASSES } from "../../utils/tableLayout";
import ExcluirButton from "../ExcluirButton";
import DesativarButton from "../DesativarButton";
import AtivarButton from "../AtivarButton";
import StatusPill from "../StatusPill";

interface ListaLivroProps {
  livros: Livro[];
  livroExcluindo?: number | null;
  onEditar?: (livro: Livro) => void;
  onExcluir?: (livro: Livro) => void;
  onAtivar?: (livro: Livro) => void;
  onDesativar?: (livro: Livro) => void;
}

export default function ListaLivro({
  livros,
  livroExcluindo,
  onEditar,
  onExcluir,
  onAtivar,
  onDesativar,
}: ListaLivroProps) {
  return (
    <div className="w-full bg-white border border-[#cfe5d4] rounded-2xl overflow-hidden shadow-xs">
      <table className="w-full text-left border-collapse table-fixed">
        <colgroup>
          <col />
          <col className="hidden xl:table-column w-[20%]" />
          <col className={TABLE_COL_CLASSES.exemplares} />
          <col className={TABLE_COL_CLASSES.status} />
          <col className={TABLE_COL_CLASSES.acoes} />
        </colgroup>
        <thead>
          <tr className="bg-[#e8f4eb] border-b border-[#c5dfca] text-xs xl:text-sm font-bold text-[#1e582d] leading-snug">
            <th className="py-2.5 xl:py-3 px-4 xl:px-6 text-left whitespace-nowrap">
              Título do livro
            </th>
            <th className="py-2.5 xl:py-3 px-4 hidden xl:table-cell text-left whitespace-nowrap">
              Editora
            </th>
            <th className="py-2.5 xl:py-3 px-2 xl:px-3 text-center whitespace-nowrap">
              Total de exemplares
            </th>
            <th className="py-2.5 xl:py-3 px-2 xl:px-3 text-center whitespace-nowrap">
              Status do livro
            </th>
            <th className="py-2.5 xl:py-3 px-2 xl:px-3 text-center whitespace-nowrap">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6f0e8]">
          {livros.map((livro) => {
            const ativo = livro.status === "ATIVO" || livro.ativo === true;
            const temHistorico =
              livro.possuiHistorico ?? (livro.quantidadeEmprestada ?? 0) > 0;
            const naoPodeDesativar =
              (livro.quantidadeEmprestada ?? 0) > 0 ||
              livro.possuiEmprestimoPendente === true;
            const estaExcluindo = livroExcluindo === livro.id;

            return (
              <tr
                key={livro.id}
                className={`transition-all duration-200 hover:bg-[#f4faf6] ${
                  estaExcluindo ? "opacity-0 scale-95" : "opacity-100 scale-100"
                } ${ativo ? "bg-white" : "bg-[#fbfdfb]"}`}
              >
                <td className="py-2 xl:py-2.5 px-4 xl:px-6 text-left">
                  <span
                    title={livro.titulo}
                    className={`text-sm xl:text-base font-semibold block leading-snug truncate max-w-full ${
                      ativo ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {livro.titulo}
                  </span>
                  <span
                    title={livro.editora}
                    className="block xl:hidden text-xs text-gray-600 leading-tight truncate max-w-full mt-0.5"
                  >
                    {livro.editora}
                  </span>
                </td>
                <td className="py-2 xl:py-2.5 px-4 hidden xl:table-cell text-left">
                  <span
                    title={livro.editora}
                    className={`text-sm xl:text-base font-normal block leading-snug truncate max-w-full ${
                      ativo ? "text-gray-700" : "text-gray-500"
                    }`}
                  >
                    {livro.editora}
                  </span>
                </td>
                <td className="py-2 xl:py-2.5 px-2 xl:px-3 text-center whitespace-nowrap">
                  <div className="inline-flex items-baseline justify-center gap-1.5">
                    <span
                      className={`w-6 text-right font-normal text-sm xl:text-base tabular-nums ${
                        ativo ? "text-gray-700" : "text-gray-500"
                      }`}
                    >
                      {livro.quantidadeTotal}
                    </span>
                    <span
                      className={`w-[78px] xl:w-[90px] text-left font-normal text-sm xl:text-base ${
                        ativo ? "text-gray-700" : "text-gray-500"
                      }`}
                    >
                      {livro.quantidadeTotal === 1 ? "exemplar" : "exemplares"}
                    </span>
                  </div>
                </td>
                <td className="py-2 xl:py-2.5 px-2 xl:px-3 text-center">
                  <StatusPill status={ativo ? "ATIVO" : "INATIVO"} />
                </td>
                <td className="py-2 xl:py-2.5 px-2 xl:px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 xl:gap-2 shrink-0">
                    {ativo ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditar?.(livro)}
                          className="inline-flex items-center justify-center gap-1 xl:gap-1.5 w-[88px] xl:w-[96px] 2xl:w-[98px] h-8 bg-[#389348] text-white text-xs xl:text-sm rounded-lg font-semibold hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                        >
                          <MdEdit size={15} />
                          Editar
                        </button>

                        {temHistorico ? (
                          <DesativarButton
                            onClick={() => onDesativar?.(livro)}
                            disabled={naoPodeDesativar}
                            title={
                              naoPodeDesativar
                                ? "Não é possível desativar este livro, pois ele possui empréstimos pendentes."
                                : undefined
                            }
                          />
                        ) : (
                          <ExcluirButton onClick={() => onExcluir?.(livro)} />
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled
                          title="Livro desativado não pode ser editado"
                          className="inline-flex items-center justify-center gap-1 xl:gap-1.5 w-[88px] xl:w-[96px] 2xl:w-[98px] h-8 bg-gray-200 text-gray-400 text-xs xl:text-sm rounded-lg font-semibold cursor-not-allowed shrink-0"
                        >
                          <MdEdit size={15} />
                          Editar
                        </button>

                        <AtivarButton onClick={() => onAtivar?.(livro)} />
                      </>
                    )}
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
