import { MdDelete, MdEdit } from "react-icons/md";

import { Turma } from "../../types/turma";

interface CardTurmasProps {
  turma: Turma;
}

export default function CardTurma({ turma }: CardTurmasProps) {
  const ativo = turma.status === "ATIVO";

  return (
    <div className="bg-[#eef7f0] rounded-2xl px-6 py-5 w-full h-full min-h-[150px] flex flex-col justify-between transition-all">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-bold text-[#245B2F] pr-2 line-clamp-1">
          {turma.nome}
        </h3>

        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-[#d8f3dc] text-[#2e8b45] px-2.5 py-1 rounded-lg font-medium text-xs">
            {ativo ? "Ativo" : "Inativo"}
          </span>

          <button
            type="button"
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
              ativo ? "bg-[#389348]" : "bg-gray-400"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                ativo ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-auto">
        <div className="border-t border-[#D3E8D6] my-3" />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="flex items-center gap-1.5 bg-[#389348] text-white px-4 py-2 text-sm rounded-lg font-medium hover:bg-[#2e7d3d] transition-colors cursor-pointer"
          >
            <MdEdit size={15} />
            Editar
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 text-sm rounded-lg font-medium hover:bg-[#b9151b] transition-colors cursor-pointer"
          >
            <MdDelete size={15} />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}