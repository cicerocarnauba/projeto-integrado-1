import { ReactNode } from "react";

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

  const corConfirmar =
    variante === "perigo"
      ? "bg-[#dc3b3b] hover:bg-[#c42e2e]"
      : "bg-[#2e8b45] hover:bg-[#236c35]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancelar}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-3">{titulo}</h2>
        <div className="text-sm text-gray-600 mb-6">{mensagem}</div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer ${corConfirmar}`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
