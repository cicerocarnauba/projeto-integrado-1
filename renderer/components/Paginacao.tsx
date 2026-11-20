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
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-3.5 pt-3 border-t border-[#d8ecde] ${className}`}
    >
      {/* Indicador claro e amigável: Página X de Y • N entidades */}
      <div className="flex items-center gap-3">
        <span className="text-[15px] font-semibold text-gray-800 tabular-nums">
          Página <span className="text-[#2e8b45] font-bold">{paginaAtual}</span> de{" "}
          <span>{totalPaginas}</span>
        </span>
        <span className="text-gray-300">•</span>
        <span className="bg-[#e8f5ec] text-[#1e582d] text-[13.5px] font-semibold px-3.5 py-1 rounded-full border border-[#c6e3cd] tabular-nums">
          {totalResumo} {formatarEntidade(totalResumo, nomeEntidade, nomeEntidadeSingular)}
        </span>
      </div>

      {/* Controles de Navegação */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => aoMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual <= 1}
          aria-label="Página anterior"
          className={`h-10 px-4 flex items-center gap-1.5 rounded-xl font-semibold text-[14.5px] transition-all shadow-2xs ${
            paginaAtual <= 1
              ? "bg-gray-100 border border-gray-200 text-gray-400 opacity-65 cursor-not-allowed"
              : "bg-white border border-[#cde5d4] text-[#1e582d] hover:bg-[#eef7f0] hover:border-[#2e8b45] cursor-pointer active:scale-95"
          }`}
        >
          <MdChevronLeft size={20} className={paginaAtual <= 1 ? "text-gray-400" : "text-[#2e8b45]"} />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-1.5">
          {obterPaginasVisiveis().map((item, index) => {
            if (typeof item === "string") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 text-center text-[15px] font-bold text-gray-400 select-none"
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
                className={`h-10 min-w-10 px-3 flex items-center justify-center rounded-xl text-[15px] font-bold tabular-nums transition-all shadow-2xs ${
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
          className={`h-10 px-4 flex items-center gap-1.5 rounded-xl font-semibold text-[14.5px] transition-all shadow-2xs ${
            paginaAtual >= totalPaginas
              ? "bg-gray-100 border border-gray-200 text-gray-400 opacity-65 cursor-not-allowed"
              : "bg-white border border-[#cde5d4] text-[#1e582d] hover:bg-[#eef7f0] hover:border-[#2e8b45] cursor-pointer active:scale-95"
          }`}
        >
          <span>Próximo</span>
          <MdChevronRight size={20} className={paginaAtual >= totalPaginas ? "text-gray-400" : "text-[#2e8b45]"} />
        </button>
      </div>
    </div>
  );
}
