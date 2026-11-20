import React from "react";

export type StatusAba = "ATIVO" | "INATIVO";

interface AbasStatusProps {
  abaAtiva: StatusAba;
  onChangeAba: (aba: StatusAba) => void;
  labelAtivos?: string;
  labelInativos?: string;
}

export default function AbasStatus({
  abaAtiva,
  onChangeAba,
  labelAtivos = "Ativos",
  labelInativos = "Inativos",
}: AbasStatusProps) {
  const abaClass = (ativa: boolean) =>
    `pb-3 px-1 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
      ativa
        ? "text-[#389348] border-[#389348]"
        : "text-gray-500 border-transparent hover:text-gray-700"
    }`;

  return (
    <div
      role="tablist"
      aria-label="Filtrar por status"
      className="flex gap-8 border-b border-[#E6F0E8] mb-4 w-full"
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
      </button>
    </div>
  );
}
