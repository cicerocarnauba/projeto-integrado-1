import { MdCheck, MdClear } from "react-icons/md";

interface ModalConfirmarExclusaoProps {
  isOpen: boolean;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalConfirmarExclusao({
  isOpen,
  carregando = false,
  onConfirmar,
  onCancelar,
}: ModalConfirmarExclusaoProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs"
      onClick={() => {
        if (!carregando) onCancelar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-fade-in"
      >
        <h2 className="text-xl font-bold text-[#1e582d] mb-8 leading-snug px-4">
          Deseja excluir as informações do item selecionado?
        </h2>

        <div className="flex items-center justify-center gap-4 w-full">
          <button
            type="button"
            onClick={onCancelar}
            disabled={carregando}
            className="flex items-center justify-center gap-1.5 min-w-[110px] px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdClear size={18} />
            Não
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={carregando}
            className="flex items-center justify-center gap-1.5 min-w-[110px] px-6 py-2.5 bg-[#2e8b45] hover:bg-[#236c35] text-white rounded-xl text-sm font-medium transition-colors shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdCheck size={18} />
            {carregando ? "Processando..." : "Sim"}
          </button>
        </div>
      </div>
    </div>
  );
}