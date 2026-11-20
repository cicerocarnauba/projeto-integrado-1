import { MdClose, MdUndo } from "react-icons/md";

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
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={() => !salvando && onCancelar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800">
          Devolver todos os exemplares?
        </h2>
        <p className="mt-3 text-gray-500">
          Tem certeza que deseja devolver todos os exemplares emprestados?
        </p>

        {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            disabled={salvando}
            onClick={onCancelar}
            className="flex items-center gap-2 rounded-xl bg-[#dc3b3b] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#c42e2e] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <MdClose size={18} />
            Cancelar
          </button>

          <button
            type="button"
            disabled={salvando}
            onClick={onConfirmar}
            className="flex items-center gap-2 rounded-xl bg-[#389348] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2e7d3d] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <MdUndo size={18} />
            {salvando ? "Devolvendo..." : "Devolver"}
          </button>
        </div>
      </div>
    </div>
  );
}