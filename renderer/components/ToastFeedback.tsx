import { useEffect } from "react";
import { MdCheckCircle, MdError, MdClose } from "react-icons/md";

interface ToastFeedbackProps {
  mensagem: string;
  tipo?: "sucesso" | "erro";
  onClose: () => void;
  duracao?: number;
}

export default function ToastFeedback({
  mensagem,
  tipo = "sucesso",
  onClose,
  duracao = 3000,
}: ToastFeedbackProps) {
  useEffect(() => {
    if (!mensagem) return;
    const timer = setTimeout(onClose, duracao);
    return () => clearTimeout(timer);
  }, [mensagem, duracao, onClose]);

  if (!mensagem) return null;

  const isSucesso = tipo === "sucesso";

  return (
    <aside
      aria-label="Notificação do sistema"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium border transition-all ${
          isSucesso
            ? "bg-[#2e8b45] text-white border-[#236c35] shadow-emerald-950/20"
            : "bg-[#cf4a4a] text-white border-[#b83a3a] shadow-rose-950/20"
        }`}
      >
        {isSucesso ? (
          <MdCheckCircle size={20} className="shrink-0 text-white" />
        ) : (
          <MdError size={20} className="shrink-0 text-white" />
        )}
        <span className="whitespace-nowrap">{mensagem}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 hover:opacity-75 transition-opacity cursor-pointer p-0.5 rounded-md"
          title="Fechar"
        >
          <MdClose size={16} />
        </button>
      </div>
    </aside>
  );
}
