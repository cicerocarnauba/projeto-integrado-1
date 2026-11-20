import { useEffect } from "react";
import { MdCheck, MdClear, MdClose } from "react-icons/md";

interface ModalConfirmarEmprestimoProps {
  aberto: boolean;
  titulo: string;
  mensagem: React.ReactNode;
  textoCancelar?: string;
  textoConfirmar?: string;
  variante?: "primario" | "perigo";
  onCancelar: () => void;
  onConfirmar: () => void;
}

export default function ModalConfirmarEmprestimo({
  aberto,
  titulo,
  mensagem,
  textoCancelar = "Cancelar",
  textoConfirmar = "Confirmar",
  variante = "primario",
  onCancelar,
  onConfirmar,
}: ModalConfirmarEmprestimoProps) {
  useEffect(() => {
    if (!aberto) return;

    function aoPressionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onCancelar();
    }

    document.addEventListener("keydown", aoPressionarTecla);
    return () => document.removeEventListener("keydown", aoPressionarTecla);
  }, [aberto, onCancelar]);

  if (!aberto) return null;

  const isPerigo = variante === "perigo";

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
        aria-labelledby="modal-confirmar-emprestimo-titulo"
        className="w-full max-w-md bg-white border border-[#dcece0] rounded-2xl shadow-2xl p-6"
      >
        <h2
          id="modal-confirmar-emprestimo-titulo"
          className="text-xl font-bold text-gray-900"
        >
          {titulo}
        </h2>

        <p className="mt-2 text-[15px] text-gray-600 leading-relaxed">
          {mensagem}
        </p>

        <div className="flex justify-end items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-[14.5px] font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors active:scale-95 cursor-pointer"
          >
            <MdClear size={17} />
            {textoCancelar}
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            autoFocus
            className={`h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-[14.5px] font-semibold text-white transition-colors active:scale-95 cursor-pointer ${
              isPerigo
                ? "bg-[#cf4a4a] hover:bg-[#b83a3a]"
                : "bg-[#2e8b45] hover:bg-[#236c35]"
            }`}
          >
            {isPerigo ? <MdClose size={17} /> : <MdCheck size={17} />}
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
