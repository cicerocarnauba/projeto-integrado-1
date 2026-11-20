import React from "react";

interface EstadoListaProps {
  mensagem: string;
}

/**
 * Cartão padrão para estados de carregamento ou listagem vazia.
 */
export default function EstadoLista({ mensagem }: EstadoListaProps) {
  return (
    <div className="w-full bg-white border border-[#cfe5d4] rounded-2xl p-10 sm:p-12 text-center text-[#1e582d] shadow-xs">
      <p className="text-base font-medium">{mensagem}</p>
    </div>
  );
}
