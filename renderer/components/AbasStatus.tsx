import React from "react";

export type StatusAba = "ATIVO" | "INATIVO";

interface AbasStatusProps {
  abaAtiva: StatusAba;
  onChangeAba: (aba: StatusAba) => void;
  labelAtivos?: string;
  labelInativos?: string;
  totalAtivos?: number;
  totalInativos?: number;
}

export default function AbasStatus({
  abaAtiva,
  onChangeAba,
  labelAtivos = "Ativos",
  labelInativos = "Inativos",
  totalAtivos,
  totalInativos,
}: AbasStatusProps) {
  const abaClass = (ativa: boolean) =>
    `pb-2 xl:pb-2.5 px-1 text-sm xl:text-base font-semibold border-b-[3px] transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap ${
      ativa
        ? "text-[#1e582d] border-[#2e8b45]"
        : "text-gray-500 border-transparent hover:text-gray-800 hover:border-[#cde5d4]"
    }`;

  return (
    <div
      role="tablist"
      aria-label="Filtrar por status"
      className="flex flex-wrap gap-5 sm:gap-7 xl:gap-8 border-b border-[#D3E8D6] mb-2.5 xl:mb-3.5 w-full shrink-0"
    >
      {/* Aba Ativos */}
      <button
        type="button"
        role="tab"
        id="tab-ativos"
        aria-selected={abaAtiva === "ATIVO"}
        aria-controls="painel-ativos"
        onClick={() => onChangeAba("ATIVO")}
        className={abaClass(abaAtiva === "ATIVO")}
      >
        <span>{labelAtivos}</span>
        {typeof totalAtivos === "number" && (
          <span
            className={`inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums ${
              abaAtiva === "ATIVO"
                ? "bg-[#d8f3dc] text-[#1e582d]"
                : "bg-gray-200/80 text-gray-600"
            }`}
          >
            {totalAtivos}
          </span>
        )}
      </button>

      {/* Aba Inativos */}
      <button
        type="button"
        role="tab"
        id="tab-inativos"
        aria-selected={abaAtiva === "INATIVO"}
        aria-controls="painel-inativos"
        onClick={() => onChangeAba("INATIVO")}
        className={abaClass(abaAtiva === "INATIVO")}
      >
        <span>{labelInativos}</span>
        {typeof totalInativos === "number" && (
          <span
            className={`inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums ${
              abaAtiva === "INATIVO"
                ? "bg-[#d8f3dc] text-[#1e582d]"
                : "bg-gray-200/80 text-gray-600"
            }`}
          >
            {totalInativos}
          </span>
        )}
      </button>
    </div>
  );
}
