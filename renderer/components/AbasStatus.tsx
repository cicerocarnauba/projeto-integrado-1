import React from "react";

export type StatusAba = "ATIVO" | "INATIVO";

interface AbasStatusProps {
  abaAtiva: StatusAba;
  onChangeAba: (aba: StatusAba) => void;
  totalAtivos?: number;
  totalInativos?: number;
  labelAtivos?: string;
  labelInativos?: string;
}

export default function AbasStatus({
  abaAtiva,
  onChangeAba,
  totalAtivos,
  totalInativos,
  labelAtivos = "Ativos",
  labelInativos = "Inativos",
}: AbasStatusProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por status"
      className="flex items-center gap-2 border-b border-[#D3E8D6] mb-5 w-full"
    >
      {/* Aba Ativos */}
      <button
        type="button"
        role="tab"
        id="tab-ativos"
        aria-selected={abaAtiva === "ATIVO"}
        aria-controls="painel-ativos"
        onClick={() => onChangeAba("ATIVO")}
        className={`group flex items-center gap-2 pb-3 px-3.5 text-sm font-medium transition-all relative cursor-pointer border-b-2 -mb-px ${
          abaAtiva === "ATIVO"
            ? "border-[#2e8b45] text-[#1e582d] font-semibold"
            : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            abaAtiva === "ATIVO" ? "bg-[#2e8b45]" : "bg-gray-300 group-hover:bg-gray-400"
          }`}
        />
        <span>{labelAtivos}</span>
        {totalAtivos !== undefined && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
              abaAtiva === "ATIVO"
                ? "bg-[#e2f3e6] text-[#1e582d]"
                : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
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
        className={`group flex items-center gap-2 pb-3 px-3.5 text-sm font-medium transition-all relative cursor-pointer border-b-2 -mb-px ${
          abaAtiva === "INATIVO"
            ? "border-[#2e8b45] text-[#1e582d] font-semibold"
            : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            abaAtiva === "INATIVO" ? "bg-gray-500" : "bg-gray-300 group-hover:bg-gray-400"
          }`}
        />
        <span>{labelInativos}</span>
        {totalInativos !== undefined && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
              abaAtiva === "INATIVO"
                ? "bg-[#e2f3e6] text-[#1e582d]"
                : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
            }`}
          >
            {totalInativos}
          </span>
        )}
      </button>
    </div>
  );
}
