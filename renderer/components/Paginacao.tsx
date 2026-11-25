import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

export interface PaginacaoProps {
  paginaAtual: number;
  totalItens: number;
  totalBalao?: number;
  itensPorPagina?: number;
  nomeEntidade?: string;
  nomeEntidadeSingular?: string;
  aoMudarPagina: (pagina: number) => void;
  className?: string;
}

function formatarEntidade(total: number, plural: string, singular?: string): string {
  if (total === 1) {
    if (singular) return singular;
    if (plural.toLowerCase().endsWith("res")) return plural.slice(0, -2);
    if (plural.toLowerCase().endsWith("s")) return plural.slice(0, -1);
    return plural;
  }
  return plural;
}

export default function Paginacao({
  paginaAtual,
  totalItens,
  totalBalao,
  itensPorPagina = 12,
  nomeEntidade = "itens",
  nomeEntidadeSingular,
  aoMudarPagina,
  className = "",
}: PaginacaoProps) {
  // Não exibe caso não haja nenhum item cadastrado
  if (totalItens <= 0) {
    return null;
  }

  const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));

  const totalResumo = totalBalao ?? totalItens;

  const obterPaginasVisiveis = () => {
    const paginas: (number | string)[] = [];
    const maxBotoes = 5;

    if (totalPaginas <= maxBotoes + 2) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);

      const inicioJanela = Math.max(2, paginaAtual - 1);
      const fimJanela = Math.min(totalPaginas - 1, paginaAtual + 1);

      if (inicioJanela > 2) {
        paginas.push("...");
      }

      for (let i = inicioJanela; i <= fimJanela; i++) {
        paginas.push(i);
      }

      if (fimJanela < totalPaginas - 1) {
        paginas.push("...");
      }

      paginas.push(totalPaginas);
    }

    return paginas;
  };

  return (
    <div
      data-paginacao
      className={`flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 mt-2.5 xl:mt-3 pt-2.5 border-t border-[#d8ecde] shrink-0 ${className}`}
    >
      {/* Indicador claro e amigável: Página X de Y • N entidades */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-sm xl:text-base font-semibold text-gray-800 tabular-nums whitespace-nowrap">
          Página <span className="text-[#2e8b45] font-bold">{paginaAtual}</span> de{" "}
          <span>{totalPaginas}</span>
        </span>
        <span className="text-gray-300">•</span>
        <span className="bg-[#e8f5ec] text-[#1e582d] text-xs xl:text-sm font-semibold px-3 py-0.5 xl:px-3.5 xl:py-1 rounded-full border border-[#c6e3cd] tabular-nums whitespace-nowrap">
          {totalResumo} {formatarEntidade(totalResumo, nomeEntidade, nomeEntidadeSingular)}
        </span>
      </div>

      {/* Controles de Navegação */}
      <div className="flex items-center gap-1.5 xl:gap-2">
        <button
          type="button"
          onClick={() => aoMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual <= 1}
          aria-label="Página anterior"
          className={`h-9 xl:h-10 px-3 xl:px-4 flex items-center gap-1 xl:gap-1.5 rounded-xl font-semibold text-xs xl:text-sm transition-all shadow-2xs ${
            paginaAtual <= 1
              ? "bg-gray-100 border border-gray-200 text-gray-400 opacity-65 cursor-not-allowed"
              : "bg-white border border-[#cde5d4] text-[#1e582d] hover:bg-[#eef7f0] hover:border-[#2e8b45] cursor-pointer active:scale-95"
          }`}
        >
          <MdChevronLeft size={19} className={paginaAtual <= 1 ? "text-gray-400" : "text-[#2e8b45]"} />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-1 xl:gap-1.5">
          {obterPaginasVisiveis().map((item, index) => {
            if (typeof item === "string") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-6 xl:w-8 text-center text-sm xl:text-base font-bold text-gray-400 select-none"
                >
                  {item}
                </span>
              );
            }

            const ativa = item === paginaAtual;
            return (
              <button
                key={`page-${item}`}
                type="button"
                onClick={() => aoMudarPagina(item)}
                aria-current={ativa ? "page" : undefined}
                className={`h-9 min-w-9 xl:h-10 xl:min-w-10 px-2.5 xl:px-3 flex items-center justify-center rounded-xl text-sm xl:text-base font-bold tabular-nums transition-all shadow-2xs ${
                  ativa
                    ? "bg-[#2e8b45] text-white border border-[#2e8b45]"
                    : "bg-white border border-[#cde5d4] text-[#1e582d] hover:bg-[#eef7f0] hover:border-[#2e8b45] cursor-pointer active:scale-95"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => aoMudarPagina(paginaAtual + 1)}
          disabled={paginaAtual >= totalPaginas}
          aria-label="Próxima página"
          className={`h-9 xl:h-10 px-3 xl:px-4 flex items-center gap-1 xl:gap-1.5 rounded-xl font-semibold text-xs xl:text-sm transition-all shadow-2xs ${
            paginaAtual >= totalPaginas
              ? "bg-gray-100 border border-gray-200 text-gray-400 opacity-65 cursor-not-allowed"
              : "bg-white border border-[#cde5d4] text-[#1e582d] hover:bg-[#eef7f0] hover:border-[#2e8b45] cursor-pointer active:scale-95"
          }`}
        >
          <span>Próximo</span>
          <MdChevronRight size={19} className={paginaAtual >= totalPaginas ? "text-gray-400" : "text-[#2e8b45]"} />
        </button>
      </div>
    </div>
  );
}
