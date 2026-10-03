import {
  MdCheckCircleOutline,
  MdEdit,
  MdRemoveCircleOutline,
} from "react-icons/md";

import { Turma } from "../../types/turma";
import DesativarButton from "../DesativarButton";
import AtivarButton from "../AtivarButton";
import ExcluirButton from "../ExcluirButton";

interface CardTurmasProps {
  turma: Turma;
  onEditar?: (turma: Turma) => void;
  onDesativar?: (turma: Turma) => void;
  onAtivar?: (turma: Turma) => void;
  onExcluir?: (turma: Turma) => void;
}

export default function CardTurma({
  turma,
  onEditar,
  onDesativar,
  onAtivar,
  onExcluir,
}: CardTurmasProps) {
  const ativo = turma.status === "ATIVO";
  const historico: boolean = false

  return (
    <div
      className={`rounded-2xl p-5 w-full h-full min-h-[150px] flex flex-col justify-between transition-all ${
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

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs shrink-0 transition-colors ${
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

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {ativo ? (
              <>
                <button
                  type="button"
                  onClick={() => onEditar?.(turma)}
                  className="flex items-center gap-1.5 bg-[#389348] text-white px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-[#2e7d3d] transition-colors cursor-pointer shrink-0"
                >
                  <MdEdit size={14} />
                  Editar
                </button>
                
                {historico ? (
                  <>
                    <DesativarButton 
                    onClick={() => onDesativar?.(turma)}
                    />
                  </>
                ) : (
                  <>
                    <ExcluirButton
                      onClick={() => onExcluir?.(turma)}/>
                  </>
                )}
                
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  title="Turma desativada não pode ser editada"
                  className="flex items-center gap-1.5 bg-gray-200 text-gray-400 px-3 py-1.5 text-xs rounded-lg font-medium cursor-not-allowed shrink-0"
                >
                  <MdEdit size={14} />
                  Editar
                </button>

                <AtivarButton 
                  onClick={() => onAtivar?.(turma)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}