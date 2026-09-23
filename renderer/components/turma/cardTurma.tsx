import {
  MdCheckCircleOutline,
  MdEdit,
  MdRemoveCircleOutline,
} from "react-icons/md";
import { Turma } from "../../types/turma";

interface CardTurmasProps {
  turma: Turma;
  onEditar?: (turma: Turma) => void;
  onDesativar?: (turma: Turma) => void;
  onAtivar?: (turma: Turma) => void;
}

export default function CardTurma({
  turma,
  onEditar,
  onDesativar,
  onAtivar,
}: CardTurmasProps) {
  const ativo = turma.status === "ATIVO";

  const handleDesativar = (e: React.MouseEvent) => {
    e.preventDefault();
    onDesativar?.(turma);
  };

  const handleAtivar = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`rounded-2xl px-6 py-5 w-full h-full min-h-[150px] flex flex-col justify-between transition-all ${
        ativo ? "bg-[#eef7f0]" : "bg-[#f8faf9] border border-gray-200"
      }`}
    >
      <div>
        <div className="h-7 flex items-center">
          <h3
            className={`text-sm font-bold line-clamp-1 ${
              ativo ? "text-[#245B2F]" : "text-gray-700"
            }`}
          >
            {turma.nome}
          </h3>
        </div>
      </div>

      <div className="mt-auto">
        <div className="border-t border-[#D3E8D6] my-3" />

        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs shrink-0 transition-colors ${
              ativo
                ? "bg-[#d8f3dc] text-[#1e582d] border border-[#c1e7c9]"
                : "bg-gray-200/80 text-gray-600 border border-gray-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                ativo ? "bg-[#2e8b45]" : "bg-gray-400"
              }`}
            />
            {ativo ? "Ativo" : "Inativo"}
          </span>

          <div className="flex items-center gap-2.5">
            {ativo ? (
              <>
                <button
                  type="button"
                  onClick={() => onEditar?.(turma)}
                  className="flex items-center gap-1.5 bg-[#389348] text-white px-4 py-2 text-sm rounded-lg font-medium hover:bg-[#2e7d3d] transition-colors cursor-pointer"
                >
                  <MdEdit size={15} />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={handleDesativar}
                  className="flex items-center gap-1.5 bg-[#cf4a4a] text-white px-4 py-2 text-sm rounded-lg font-medium hover:bg-[#b83a3a] transition-colors cursor-pointer"
                >
                  <MdRemoveCircleOutline size={15} />
                  Desativar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  title="Turma desativada não pode ser editada"
                  className="flex items-center gap-1.5 bg-gray-200 text-gray-400 px-4 py-2 text-sm rounded-lg font-medium cursor-not-allowed"
                >
                  <MdEdit size={15} />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={handleAtivar}
                  className="flex items-center gap-1.5 bg-[#2e8b45] text-white px-4 py-2 text-sm rounded-lg font-medium hover:bg-[#236c35] transition-colors cursor-pointer"
                >
                  <MdCheckCircleOutline size={15} />
                  Ativar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}