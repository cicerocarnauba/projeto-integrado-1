import { MdRemoveCircleOutline, MdClear, MdWarningAmber } from "react-icons/md";
import React from "react";

interface ModalDesativarProps {
  aberto: boolean;
  titulo?: string;
  mensagem: React.ReactNode;
  aviso?: React.ReactNode;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalDesativar({
  aberto,
  titulo = "Desativar registro?",
  mensagem,
  aviso,
  onConfirmar,
  onCancelar,
}: ModalDesativarProps) {
  if (!aberto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-gray-800">
          {titulo}
        </h2>

        <div className="mt-2 text-sm text-gray-600">
          {mensagem}
        </div>

        {aviso && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2.5">
            <MdWarningAmber size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{aviso}</div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <MdClear size={16} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#cf4a4a] hover:bg-[#b83a3a] transition-colors cursor-pointer"
          >
            <MdRemoveCircleOutline size={16}/>
            Desativar
          </button>
        </div>
      </div>
    </div>
  );
}