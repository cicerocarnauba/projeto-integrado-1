
import {MdCheck, MdClear} from "react-icons/md"

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
  titulo = "Ativar registro?",
  mensagem,
  onConfirmar,
  onCancelar,
}: ModalExcluirProps) {
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#2e8b45] hover:bg-[#236c35] transition-colors cursor-pointer"
          >
            <MdCheck size={16}/>
                Ativar
          </button>
        </div>
      </div>
    </div>
  );
}