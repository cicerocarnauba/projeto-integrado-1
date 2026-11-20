import React from "react";

export type TipoStatusPill =
  | "ATIVO"
  | "INATIVO"
  | "PENDENTE"
  | "CONCLUIDO"
  | "CANCELADO";

const STATUS_CONFIG: Record<
  TipoStatusPill,
  { label: string; badge: string; dot: string }
> = {
  ATIVO: {
    label: "Ativo",
    badge: "bg-[#d8f3dc] text-[#1e582d] border-[#bfe5c6]",
    dot: "bg-[#2e8b45]",
  },
  INATIVO: {
    label: "Inativo",
    badge: "bg-gray-200/80 text-gray-600 border-gray-300",
    dot: "bg-gray-400",
  },
  PENDENTE: {
    label: "Pendente",
    badge: "bg-[#fff4d6] text-[#9a4406] border-[#fbd98a]",
    dot: "bg-[#f59e0b]",
  },
  CONCLUIDO: {
    label: "Concluído",
    badge: "bg-[#d8f3dc] text-[#1e582d] border-[#bfe5c6]",
    dot: "bg-[#2e8b45]",
  },
  CANCELADO: {
    label: "Cancelado",
    badge: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]",
    dot: "bg-[#dc2626]",
  },
};

export default function StatusPill({ status }: { status: TipoStatusPill }) {
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.INATIVO;
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-xs border whitespace-nowrap shrink-0 ${s.badge}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}
