import { MdEdit } from "react-icons/md";
import { Professor } from "../../types/professor";
import { TABLE_COL_WIDTHS } from "../../utils/tableLayout";
import ExcluirButton from "../ExcluirButton";
import DesativarButton from "../DesativarButton";
import AtivarButton from "../AtivarButton";
import StatusPill from "../StatusPill";

interface ListaProfessorProps {
  professores: Professor[];
  professorExcluindo?: number | null;
  onEditar?: (professor: Professor) => void;
  onExcluir?: (professor: Professor) => void;
  onDesativar?: (professor: Professor) => void;
  onAtivar?: (professor: Professor) => void;
}

export default function ListaProfessor({
  professores,
  professorExcluindo,
  onEditar,
  onExcluir,
  onDesativar,
  onAtivar,
}: ListaProfessorProps) {
  return (
    <div className="w-full bg-white border border-[#cfe5d4] rounded-2xl overflow-hidden shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[660px] lg:min-w-[940px] text-left border-collapse table-fixed">
          <colgroup>
            <col />
            <col className="hidden lg:table-column" style={{ width: "28%" }} />
            <col style={{ width: TABLE_COL_WIDTHS.status }} />
            <col style={{ width: TABLE_COL_WIDTHS.acoes }} />
          </colgroup>
          <thead>
            <tr className="bg-[#e8f4eb] border-b border-[#c5dfca] text-sm font-bold text-[#1e582d] leading-snug">
              <th className="py-3 px-6 text-left whitespace-nowrap">Nome do professor</th>
              <th className="py-3 px-4 hidden lg:table-cell text-left whitespace-nowrap">E-mail</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Status do professor</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6f0e8]">
            {professores.map((professor) => {
              const ativo = professor.status === "ATIVO" || professor.ativo === true;
              const temHistorico = professor.possuiHistorico ?? false;
              const naoPodeDesativar = professor.possuiEmprestimoPendente === true;
              const estaExcluindo = professorExcluindo === professor.id;

              return (
                <tr
                  key={professor.id}
                  className={`transition-all duration-200 hover:bg-[#f4faf6] ${
                    estaExcluindo ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  } ${ativo ? "bg-white" : "bg-[#fbfdfb]"}`}
                >
                  <td className="py-2.5 px-6 text-left">
                    <span
                      title={`${professor.primeiroNome} ${professor.sobrenome}`}
                      className={`text-base font-semibold block leading-snug truncate max-w-full ${
                        ativo ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {professor.primeiroNome} {professor.sobrenome}
                    </span>
                    <span
                      title={professor.email}
                      className="block lg:hidden text-xs text-gray-600 truncate max-w-full mt-0.5"
                    >
                      {professor.email}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 hidden lg:table-cell text-left">
                    <span
                      title={professor.email}
                      className={`text-sm font-medium block leading-snug truncate max-w-full ${
                        ativo ? "text-gray-700" : "text-gray-500"
                      }`}
                    >
                      {professor.email}
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
                            onClick={() => onEditar?.(professor)}
                            className="inline-flex items-center justify-center gap-1.5 w-[98px] h-8 bg-[#389348] text-white text-sm rounded-lg font-semibold hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                          >
                            <MdEdit size={16} />
                            Editar
                          </button>

                          {temHistorico ? (
                            <DesativarButton
                              onClick={() => onDesativar?.(professor)}
                              disabled={naoPodeDesativar}
                              title={
                                naoPodeDesativar
                                  ? "Não é possível desativar este professor, pois ele possui empréstimos pendentes."
                                  : undefined
                              }
                            />
                          ) : (
                            <ExcluirButton
                              onClick={() => onExcluir?.(professor)}
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled
                            title="Professor desativado não pode ser editado"
                            className="inline-flex items-center justify-center gap-1.5 w-[98px] h-8 bg-gray-200 text-gray-400 text-sm rounded-lg font-semibold cursor-not-allowed shrink-0"
                          >
                            <MdEdit size={16} />
                            Editar
                          </button>

                          <AtivarButton onClick={() => onAtivar?.(professor)} />
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
