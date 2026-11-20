import { MdDelete, MdClear } from "react-icons/md";
import React from "react";

interface ModalExcluirProps {
  aberto: boolean;
  titulo?: string;
  mensagem: React.ReactNode;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalExcluir({
  aberto,
  titulo = "Excluir registro?",
  mensagem,
  onConfirmar,
  onCancelar,
}: ModalExcluirProps) {
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
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-[14.5px] font-semibold text-white bg-[#cf4a4a] hover:bg-[#b83a3a] transition-colors cursor-pointer"
          >
            <MdDelete size={17} />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
