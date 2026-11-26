import { useEffect } from "react";
import { MdClear, MdUndo } from "react-icons/md";

interface ModalDevolverTodosProps {
  aberto: boolean;
  salvando?: boolean;
  erro?: string;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export default function ModalDevolverTodos({
  aberto,
  salvando = false,
  erro,
  onCancelar,
  onConfirmar,
}: ModalDevolverTodosProps) {
  useEffect(() => {
    if (!aberto || salvando) return;
    function aoPressionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onCancelar();
    }
    document.addEventListener("keydown", aoPressionarTecla);
    return () => document.removeEventListener("keydown", aoPressionarTecla);
  }, [aberto, salvando, onCancelar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-fade-in"
      onClick={() => !salvando && onCancelar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md border border-[#dcece0] rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900">
          Devolver todos os exemplares?
        </h2>
        <p className="mt-2 text-base text-gray-600 leading-relaxed">
          Tem certeza que deseja devolver todos os exemplares pendentes deste empréstimo?
        </p>

        {erro && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erro}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={salvando}
            onClick={onCancelar}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <MdClear size={17} />
            Cancelar
          </button>

          <button
            type="button"
            disabled={salvando}
            onClick={onConfirmar}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-sm font-semibold text-white bg-[#2e8b45] hover:bg-[#236c35] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <MdUndo size={17} />
            {salvando ? "Devolvendo..." : "Devolver"}
          </button>
        </div>
      </div>
    </div>
  );
}
