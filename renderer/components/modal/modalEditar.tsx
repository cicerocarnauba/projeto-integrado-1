import { MdCheck, MdClear, MdWarningAmber } from "react-icons/md";
import React from "react";

interface ModalEditarProps {
  aberto: boolean;
  titulo?: string;
  mensagem: React.ReactNode;
  aviso?: React.ReactNode;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalEditar({
  aberto,
  titulo = "Confirmar edição?",
  mensagem,
  aviso,
  onConfirmar,
  onCancelar,
}: ModalEditarProps) {
  if (!aberto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white border border-[#dcece0] rounded-2xl shadow-2xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>

        <div className="mt-2 text-[15px] text-gray-600 leading-relaxed">
          {mensagem}
        </div>

        {aviso && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[14px] text-amber-800 flex items-start gap-2.5">
            <MdWarningAmber size={19} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{aviso}</div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-[14.5px] font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <MdClear size={17} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-[14.5px] font-semibold text-white bg-[#2e8b45] hover:bg-[#236c35] transition-colors cursor-pointer"
          >
            <MdCheck size={17} />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
