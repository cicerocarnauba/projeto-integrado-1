import { MdEdit } from "react-icons/md";
import { Turma } from "../../types/turma";
import { TABLE_COL_CLASSES } from "../../utils/tableLayout";
import DesativarButton from "../DesativarButton";
import AtivarButton from "../AtivarButton";
import ExcluirButton from "../ExcluirButton";
import StatusPill from "../StatusPill";

interface ListaTurmaProps {
  turmas: Turma[];
  turmaExcluindo?: number | null;
  onEditar?: (turma: Turma) => void;
  onDesativar?: (turma: Turma) => void;
  onAtivar?: (turma: Turma) => void;
  onExcluir?: (turma: Turma) => void;
}

export default function ListaTurma({
  turmas,
  turmaExcluindo,
  onEditar,
  onDesativar,
  onAtivar,
  onExcluir,
}: ListaTurmaProps) {
  return (
    <div className="w-full bg-white border border-[#cfe5d4] rounded-2xl overflow-hidden shadow-xs">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-[#e8f4eb] border-b border-[#c5dfca] text-xs xl:text-sm font-bold text-[#1e582d] leading-snug">
            <th className="py-2.5 xl:py-3 px-4 xl:px-5 text-left truncate">
              Nome da turma
            </th>
            <th
              className={`py-2.5 xl:py-3 px-2 ${TABLE_COL_CLASSES.status} text-center truncate`}
            >
              Status da turma
            </th>
            <th
              className={`py-2.5 xl:py-3 px-2 ${TABLE_COL_CLASSES.acoes} text-center truncate`}
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6f0e8]">
          {turmas.map((turma) => {
            const ativo = turma.status === "ATIVO";
            const temHistorico = turma.possuiHistorico ?? false;
            const naoPodeDesativar = turma.possuiEmprestimoPendente === true;
            const estaExcluindo = turmaExcluindo === turma.id;

            return (
              <tr
                key={turma.id}
                className={`transition-all duration-200 hover:bg-[#f4faf6] ${
                  estaExcluindo ? "opacity-0 scale-95" : "opacity-100 scale-100"
                } ${ativo ? "bg-white" : "bg-[#fbfdfb]"}`}
              >
                <td className="py-2 xl:py-2.5 px-4 xl:px-5 text-left overflow-hidden">
                  <span
                    title={turma.nome}
                    className={`text-sm xl:text-base font-semibold block leading-snug truncate max-w-full ${
                      ativo ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {turma.nome}
                  </span>
                </td>
                <td className="py-2 xl:py-2.5 px-2 text-center overflow-hidden">
                  <StatusPill status={ativo ? "ATIVO" : "INATIVO"} />
                </td>
                <td className="py-2 xl:py-2.5 px-2 text-center overflow-hidden">
                  <div className="flex items-center justify-center gap-1.5 xl:gap-2 shrink-0">
                    {ativo ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditar?.(turma)}
                          className="inline-flex items-center justify-center gap-1 xl:gap-1.5 w-[88px] xl:w-[96px] 2xl:w-[98px] h-8 bg-[#389348] text-white text-xs xl:text-sm rounded-lg font-semibold hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                        >
                          <MdEdit size={15} />
                          Editar
                        </button>

                        {temHistorico ? (
                          <DesativarButton
                            onClick={() => onDesativar?.(turma)}
                            disabled={naoPodeDesativar}
                            title={
                              naoPodeDesativar
                                ? "Não é possível desativar esta turma, pois ela possui empréstimos pendentes."
                                : undefined
                            }
                          />
                        ) : (
                          <ExcluirButton
                            onClick={() => onExcluir?.(turma)}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled
                          title="Turma desativada não pode ser editada"
                          className="inline-flex items-center justify-center gap-1 xl:gap-1.5 w-[88px] xl:w-[96px] 2xl:w-[98px] h-8 bg-gray-200 text-gray-400 text-xs xl:text-sm rounded-lg font-semibold cursor-not-allowed shrink-0"
                        >
                          <MdEdit size={15} />
                          Editar
                        </button>

                        <AtivarButton onClick={() => onAtivar?.(turma)} />
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
