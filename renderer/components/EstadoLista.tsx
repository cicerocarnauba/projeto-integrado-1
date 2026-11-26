import React from "react";
import { MdClose, MdInbox, MdSearchOff } from "react-icons/md";

interface EstadoListaProps {
  mensagem: string;
  carregando?: boolean;
  termoBusca?: string;
  onLimparBusca?: () => void;
}

/**
 * Cartão padrão para estados de carregamento, busca sem resultados ou listagem vazia.
 */
export default function EstadoLista({
  mensagem,
  carregando,
  termoBusca,
  onLimparBusca,
}: EstadoListaProps) {
  const estaCarregando = carregando ?? mensagem.startsWith("Carregando");
  const temBuscaAtiva = Boolean(termoBusca && termoBusca.trim().length > 0);

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-white border border-[#cfe5d4] rounded-2xl px-6 py-9 sm:py-11 flex flex-col items-center justify-center text-center shadow-xs"
    >
      {estaCarregando ? (
        <div
          aria-hidden="true"
          className="w-8 h-8 rounded-full border-[3px] border-[#d5ead9] border-t-[#2e8b45] animate-spin mb-3"
        />
      ) : (
        <div
          aria-hidden="true"
          className="w-11 h-11 xl:w-12 xl:h-12 rounded-2xl bg-[#eef7f0] border border-[#d5ead9] text-[#2e8b45] flex items-center justify-center mb-3"
        >
          {temBuscaAtiva ? <MdSearchOff size={23} /> : <MdInbox size={23} />}
        </div>
      )}

      <p className="text-sm xl:text-base font-medium text-[#1e582d] max-w-lg leading-relaxed">
        {mensagem}
      </p>

      {!estaCarregando && temBuscaAtiva && onLimparBusca && (
        <button
          type="button"
          onClick={onLimparBusca}
          className="mt-3.5 h-9 px-4 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs xl:text-sm font-semibold text-[#1e582d] bg-[#eef7f0] border border-[#cde5d4] hover:bg-[#dff0e3] hover:border-[#2e8b45] transition-colors cursor-pointer active:scale-95"
        >
          <MdClose size={16} />
          Limpar pesquisa
        </button>
      )}
    </div>
  );
}
