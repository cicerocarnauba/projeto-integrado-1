import { MdEdit } from "react-icons/md";
import { Livro } from "../../types/livro";
import ExcluirButton from "../ExcluirButton";
import DesativarButton from "../DesativarButton";
import AtivarButton from "../AtivarButton";

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
    <div className="w-full bg-white border border-[#D3E8D6] rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#ebf5ed] border-b border-[#c8decb] text-sm font-semibold text-[#23582c]">
              <th className="py-3.5 px-4 sm:px-6">Livro</th>
              <th className="py-3.5 px-3 sm:px-4 hidden md:table-cell">Editora</th>
              <th className="py-3.5 px-3 text-center w-36 shrink-0">Exemplares</th>
              <th className="py-3.5 px-3 text-center w-28 shrink-0">Status</th>
              <th className="py-3.5 px-4 text-center w-[210px] shrink-0">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6F0E8]">
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
                  className={`transition-all duration-200 hover:bg-[#f6fbf7] ${
                    estaExcluindo ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  } ${ativo ? "bg-white" : "bg-[#fcfdfc]"}`}
                >
                  <td className="py-3 px-4 sm:px-6">
                    <span
                      title={livro.titulo}
                      className={`text-sm font-medium block leading-tight ${
                        ativo ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {livro.titulo}
                    </span>
                    <span
                      title={livro.editora}
                      className="block md:hidden text-xs text-gray-500 truncate max-w-[200px] mt-0.5"
                    >
                      {livro.editora} • {livro.quantidadeTotal}{" "}
                      {livro.quantidadeTotal === 1 ? "exemplar" : "exemplares"}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 hidden md:table-cell">
                    <span
                      title={livro.editora}
                      className={`text-sm font-medium block truncate max-w-[200px] lg:max-w-xs ${
                        ativo ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {livro.editora}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-baseline justify-center gap-1.5 w-[115px]">
                      <span className="w-5 text-right font-medium text-sm text-gray-900 tabular-nums">
                        {livro.quantidadeTotal}
                      </span>
                      <span className="w-20 text-left font-medium text-sm text-gray-900">
                        {livro.quantidadeTotal === 1 ? "exemplar" : "exemplares"}
                      </span>
                    </div>
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
                            onClick={() => onEditar?.(livro)}
                            className="flex items-center justify-center gap-1.5 bg-[#389348] text-white px-2.5 sm:px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
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
                            className="flex items-center justify-center gap-1.5 bg-gray-200 text-gray-400 px-2.5 sm:px-3 py-1.5 text-xs rounded-lg font-medium cursor-not-allowed shrink-0"
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
    </div>
  );
}
