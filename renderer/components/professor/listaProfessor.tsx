import { MdEdit } from "react-icons/md";
import { Professor } from "../../types/professor";
import { TABLE_COL_CLASSES } from "../../utils/tableLayout";
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
      <table className="w-full text-left border-collapse table-fixed">
        <colgroup>
          <col />
          <col className="hidden xl:table-column w-[28%]" />
          <col className={TABLE_COL_CLASSES.status} />
          <col className={TABLE_COL_CLASSES.acoes} />
        </colgroup>
        <thead>
          <tr className="bg-[#e8f4eb] border-b border-[#c5dfca] text-xs xl:text-sm font-bold text-[#1e582d] leading-snug">
            <th className="py-2.5 xl:py-3 px-4 xl:px-6 text-left whitespace-nowrap">
              Nome do professor
            </th>
            <th className="py-2.5 xl:py-3 px-4 hidden xl:table-cell text-left whitespace-nowrap">
              E-mail
            </th>
            <th className="py-2.5 xl:py-3 px-2 xl:px-3 text-center whitespace-nowrap">
              Status do professor
            </th>
            <th className="py-2.5 xl:py-3 px-2 xl:px-3 text-center whitespace-nowrap">
              Ações
            </th>
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
                <td className="py-2 xl:py-2.5 px-4 xl:px-6 text-left">
                  <span
                    title={`${professor.primeiroNome} ${professor.sobrenome}`}
                    className={`text-sm xl:text-base font-semibold block leading-snug truncate max-w-full ${
                      ativo ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {professor.primeiroNome} {professor.sobrenome}
                  </span>
                  <span
                    title={professor.email}
                    className="block xl:hidden text-xs text-gray-600 leading-tight truncate max-w-full mt-0.5"
                  >
                    {professor.email}
                  </span>
                </td>
                <td className="py-2 xl:py-2.5 px-4 hidden xl:table-cell text-left">
                  <span
                    title={professor.email}
                    className={`text-sm xl:text-base font-normal block leading-snug truncate max-w-full ${
                      ativo ? "text-gray-700" : "text-gray-500"
                    }`}
                  >
                    {professor.email}
                  </span>
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
                          onClick={() => onEditar?.(professor)}
                          className="inline-flex items-center justify-center gap-1 xl:gap-1.5 w-[88px] xl:w-[96px] 2xl:w-[98px] h-8 bg-[#389348] text-white text-xs xl:text-sm rounded-lg font-semibold hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                        >
                          <MdEdit size={15} />
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
                          className="inline-flex items-center justify-center gap-1 xl:gap-1.5 w-[88px] xl:w-[96px] 2xl:w-[98px] h-8 bg-gray-200 text-gray-400 text-xs xl:text-sm rounded-lg font-semibold cursor-not-allowed shrink-0"
                        >
                          <MdEdit size={15} />
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
  );
}
