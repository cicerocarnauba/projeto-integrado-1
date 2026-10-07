import { MdEdit } from "react-icons/md";
import { Livro } from "../../types/livro";
import ExcluirButton from "../ExcluirButton";
import DesativarButton from "../DesativarButton";
import AtivarButton from "../AtivarButton";

interface CardLivroProps {
  livro: Livro;
  onEditar?: (livro: Livro) => void;
  onExcluir?: (livro: Livro) => void;
  onAtivar?: (livro: Livro) => void;
  onDesativar?: (livro: Livro) => void;
}

export default function CardLivro({
  livro,
  onEditar,
  onExcluir,
  onAtivar,
  onDesativar,
}: CardLivroProps) {
  const ativo = livro.status === "ATIVO" || livro.ativo === true;

  // Excluir é o padrão. Só vira Desativar quando o livro tem histórico de
  // empréstimos. Usa o campo possuiHistorico quando o backend enviar; até lá,
  // considera apenas exemplares emprestados agora.
  const temHistorico = 
    livro.possuiHistorico ?? (livro.quantidadeEmprestada ?? 0) > 0;

  return (
    <div
      className={`rounded-2xl p-5 w-full h-full min-h-[150px] flex flex-col justify-between transition-all ${
        ativo ? "bg-[#eef7f0]" : "bg-[#f8faf9] border border-gray-200"
      }`}
    >
      <div>
        <div className="h-7 flex items-center justify-between gap-2">
          <h3
            title={livro.titulo}
            className={`text-sm font-bold line-clamp-1 pr-1 ${
              ativo ? "text-[#245B2F]" : "text-gray-700"
            }`}
          >
            {livro.titulo}
          </h3>

          <span className="bg-white text-[#1e582d] text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#cde5d4] shadow-2xs shrink-0">
            {livro.quantidadeTotal}{" "}
            {livro.quantidadeTotal === 1 ? "exemplar" : "exemplares"}
          </span>
        </div>

        <p
          className={`text-xs mt-2 line-clamp-1 ${
            ativo ? "text-[#5AA365]" : "text-gray-500"
          }`}
        >
          Editora:{" "}
          <span className={ativo ? "text-[#245B2F] font-medium" : "text-gray-600"}>
            {livro.editora}
          </span>
        </p>
      </div>

      <div className="mt-auto">
        <div className="border-t border-[#D3E8D6] my-3" />

        <div className="flex items-center justify-between gap-2 flex-wrap">
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

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {ativo ? (
              <>
                <button
                  type="button"
                  onClick={() => onEditar?.(livro)}
                  className="flex items-center gap-1.5 bg-[#389348] text-white px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                >
                  <MdEdit size={14} />
                  Editar
                </button>

                {temHistorico ? (
                  <DesativarButton onClick={() => onDesativar?.(livro)} />
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
                  className="flex items-center gap-1.5 bg-gray-200 text-gray-400 px-3 py-1.5 text-xs rounded-lg font-medium cursor-not-allowed shrink-0"
                >
                  <MdEdit size={14} />
                  Editar
                </button>

                <AtivarButton onClick={() => onAtivar?.(livro)} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}