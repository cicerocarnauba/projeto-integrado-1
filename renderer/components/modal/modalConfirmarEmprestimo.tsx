import { useEffect } from "react";
import { MdCheck, MdClose } from "react-icons/md";

interface ModalConfirmarEmprestimoProps {
  aberto: boolean;
  titulo: string;
  // Aceita JSX para destacar uma palavra em negrito (ex.: <strong>realizar</strong>)
  mensagem: React.ReactNode;
  textoCancelar?: string;
  textoConfirmar?: string;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export default function ModalConfirmarEmprestimo({
  aberto,
  titulo,
  mensagem,
  textoCancelar = "Cancelar",
  textoConfirmar = "Confirmar",
  onCancelar,
  onConfirmar,
}: ModalConfirmarEmprestimoProps) {
  // Esc fecha o popup (mesmo efeito do botão vermelho)
  useEffect(() => {
    if (!aberto) return;

    function aoPressionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onCancelar();
    }

    document.addEventListener("keydown", aoPressionarTecla);
    return () => document.removeEventListener("keydown", aoPressionarTecla);
  }, [aberto, onCancelar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
      onMouseDown={(e) => {
        // Clicar no fundo escuro equivale ao botão vermelho
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirmar-emprestimo-titulo"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6"
      >
        <h2
          id="modal-confirmar-emprestimo-titulo"
          className="text-xl font-bold text-gray-900 mb-3"
        >
          {titulo}
        </h2>

        <p className="text-base text-gray-600 leading-relaxed">{mensagem}</p>

        <div className="flex justify-end items-center gap-3 mt-8">
          <button
            type="button"
            onClick={onCancelar}
            className="flex items-center justify-center gap-1.5 min-w-28 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#cf4a4a] hover:bg-red-600 transition-colors active:scale-95 cursor-pointer"
          >
            <MdClose size={18} />
            {textoCancelar}
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            autoFocus
            className="flex items-center justify-center gap-1.5 min-w-28 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2e8b45] hover:bg-[#236c35] transition-colors active:scale-95 cursor-pointer"
          >
            <MdCheck size={18} />
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
