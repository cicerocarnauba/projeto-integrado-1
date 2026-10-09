import { MdEdit } from "react-icons/md";
import { Professor } from "../../types/professor";
import ExcluirButton from "../ExcluirButton";
import DesativarButton from "../DesativarButton";
import AtivarButton from "../AtivarButton";

interface ListaProfessorProps {
  professores: Professor[];
  onEditar?: (professor: Professor) => void;
  onExcluir?: (professor: Professor) => void;
  onDesativar?: (professor: Professor) => void;
  onAtivar?: (professor: Professor) => void;
}

export default function ListaProfessor({
  professores,
  onEditar,
  onExcluir,
  onDesativar,
  onAtivar,
}: ListaProfessorProps) {
  return (
    <div className="w-full bg-white border border-[#D3E8D6] rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#ebf5ed] border-b border-[#c8decb] text-sm font-semibold text-[#23582c]">
              <th className="py-3.5 px-4 sm:px-6">Professor</th>
              <th className="py-3.5 px-3 sm:px-4 hidden md:table-cell">E-mail</th>
              <th className="py-3.5 px-3 text-center w-28 shrink-0">Status</th>
              <th className="py-3.5 px-4 text-center w-[210px] shrink-0">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6F0E8]">
            {professores.map((professor) => {
              const ativo = professor.status === "ATIVO" || professor.ativo === true;
              const temHistorico = professor.possuiHistorico ?? false;
              const naoPodeDesativar = professor.possuiEmprestimoPendente === true;

              return (
                <tr
                  key={professor.id}
                  className={`transition-all duration-200 hover:bg-[#f6fbf7] ${
                    ativo ? "bg-white" : "bg-[#fcfdfc]"
                  }`}
                >
                  <td className="py-3 px-4 sm:px-6">
                    <span
                      title={`${professor.primeiroNome} ${professor.sobrenome}`}
                      className={`text-sm font-medium block leading-tight ${
                        ativo ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {professor.primeiroNome} {professor.sobrenome}
                    </span>
                    <span
                      title={professor.email}
                      className="block md:hidden text-xs text-gray-500 truncate max-w-[170px] mt-0.5"
                    >
                      {professor.email}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 hidden md:table-cell">
                    <span
                      title={professor.email}
                      className={`text-sm font-medium block truncate max-w-[200px] lg:max-w-xs ${
                        ativo ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {professor.email}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs shrink-0 transition-colors ${
                        ativo
                          ? "bg-[#d8f3dc] text-[#1e582d] border border-[#c1e7c9]"
                          : "bg-gray-200/80 text-gray-600 border border-gray-300"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          ativo ? "bg-[#2e8b45]" : "bg-gray-400"
                        }`}
                      />
                      {ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2 shrink-0">
                      {ativo ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onEditar?.(professor)}
                            className="flex items-center justify-center gap-1.5 bg-[#389348] text-white px-2.5 sm:px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
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
                            className="flex items-center justify-center gap-1.5 bg-gray-200 text-gray-400 px-2.5 sm:px-3 py-1.5 text-xs rounded-lg font-medium cursor-not-allowed shrink-0"
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
    </div>
  );
}
