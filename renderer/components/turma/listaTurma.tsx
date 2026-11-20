import { MdEdit } from "react-icons/md";
import { Turma } from "../../types/turma";
import { TABLE_COL_WIDTHS } from "../../utils/tableLayout";
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
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[660px] text-left border-collapse table-fixed">
          <colgroup>
            <col />
            <col style={{ width: TABLE_COL_WIDTHS.status }} />
            <col style={{ width: TABLE_COL_WIDTHS.acoes }} />
          </colgroup>
          <thead>
            <tr className="bg-[#e8f4eb] border-b border-[#c5dfca] text-sm font-bold text-[#1e582d] leading-snug">
              <th className="py-3 px-6 text-left whitespace-nowrap">Nome da turma</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Status da turma</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Ações</th>
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
                  <td className="py-2.5 px-6 text-left">
                    <span
                      title={turma.nome}
                      className={`text-base font-semibold block leading-snug truncate max-w-full ${
                        ativo ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {turma.nome}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <StatusPill status={ativo ? "ATIVO" : "INATIVO"} />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-2 shrink-0">
                      {ativo ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onEditar?.(turma)}
                            className="inline-flex items-center justify-center gap-1.5 w-[98px] h-8 bg-[#389348] text-white text-sm rounded-lg font-semibold hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                          >
                            <MdEdit size={16} />
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
                            className="inline-flex items-center justify-center gap-1.5 w-[98px] h-8 bg-gray-200 text-gray-400 text-sm rounded-lg font-semibold cursor-not-allowed shrink-0"
                          >
                            <MdEdit size={16} />
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
    </div>
  );
}
