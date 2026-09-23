import { Livro } from "../../types/livro";

interface CardLivroProps {
  livro: Livro;
}

export default function CardLivro({ livro }: CardLivroProps) {
  const ativo = livro.status === "ATIVO";

  return (
    <div
      className={`rounded-2xl px-6 py-5 w-full h-full min-h-[150px] flex flex-col justify-between transition-all ${
        ativo ? "bg-[#eef7f0]" : "bg-gray-100 opacity-60"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3
            title={livro.titulo}
            className="text-sm font-bold text-[#245B2F] line-clamp-1"
          >
            {livro.titulo}
          </h3>

          {!ativo && (
            <span className="bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-lg font-medium text-xs shrink-0">
              Inativo
            </span>
          )}
        </div>

        <p className="text-xs text-[#5AA365] mt-2 line-clamp-1">
          Editora: {livro.editora}
        </p>
      </div>

      <div className="mt-auto">
        <div className="border-t border-[#D3E8D6] my-3" />

        <div className="flex items-center justify-between">
          <span className="bg-white text-[#1e582d] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#cde5d4] shadow-2xs">
            {livro.quantidadeTotal}{" "}
            {livro.quantidadeTotal === 1 ? "exemplar" : "exemplares"}
          </span>

          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1.5 bg-[#389348] text-white px-4 py-2 text-sm rounded-lg font-medium hover:bg-[#2e7d3d] transition-colors cursor-pointer shadow-2xs"
          >
            Ver detalhes &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
