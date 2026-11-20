import { ReactNode } from "react";
import { MdClear, MdClose, MdCheck } from "react-icons/md";

interface ModalConfirmarAcaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: ReactNode;
  textoConfirmar: string;
  textoCancelar?: string;
  variante?: "perigo" | "primario";
  onCancelar: () => void;
  onConfirmar: () => void;
}

export default function ModalConfirmarAcao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar,
  textoCancelar = "Voltar",
  variante = "primario",
  onCancelar,
  onConfirmar,
}: ModalConfirmarAcaoProps) {
  if (!aberto) return null;

  const isPerigo = variante === "perigo";
  const corConfirmar = isPerigo
    ? "bg-[#cf4a4a] hover:bg-[#b83a3a]"
    : "bg-[#2e8b45] hover:bg-[#236c35]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-fade-in"
      onClick={onCancelar}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white border border-[#dcece0] rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
        <div className="mt-2 text-[15px] text-gray-600 leading-relaxed">
          {mensagem}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-[14.5px] font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <MdClear size={17} />
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className={`h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-[14.5px] font-semibold text-white transition-colors cursor-pointer ${corConfirmar}`}
          >
            {isPerigo ? <MdClose size={17} /> : <MdCheck size={17} />}
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
