// import { MdCheck, MdClear } from "react-icons/md";

// interface ModalConfirmarExclusaoProps {
//   isOpen: boolean;
//   acao?: "excluir" | "desativar";
//   carregando?: boolean;
//   onConfirmar: () => void;
//   onCancelar: () => void;
// }

// export default function ModalConfirmacao({
//   isOpen,
//   acao = "excluir",
//   carregando = false,
//   onConfirmar,
//   onCancelar,
// }: ModalConfirmarExclusaoProps) {
//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs"
//       onClick={() => {
//         if (!carregando) onCancelar();
//       }}
//     >
//       <div
//         role="dialog"
//         aria-modal="true"
//         onClick={(e) => e.stopPropagation()}
//         className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-fade-in"
//       >
//         <h2 className="text-xl font-bold text-[#1e582d] mb-8 leading-snug px-4">
//           Deseja excluir as informações do item selecionado?
//         </h2>

//         <div className="flex items-center justify-center gap-4 w-full">
//           <button
//             type="button"
//             onClick={onCancelar}
//             disabled={carregando}
//             className="flex items-center justify-center gap-1.5 min-w-[110px] px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <MdClear size={18} />
//             Não
//           </button>

//           <button
//             type="button"
//             onClick={onConfirmar}
//             disabled={carregando}
//             className="flex items-center justify-center gap-1.5 min-w-[110px] px-6 py-2.5 bg-[#2e8b45] hover:bg-[#236c35] text-white rounded-xl text-sm font-medium transition-colors shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <MdCheck size={18} />
//             {carregando ? "Processando..." : "Sim"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { MdClear, MdCheck } from "react-icons/md";

interface ModalConfirmacaoProps {
  isOpen: boolean;
  /** Define se a ação é "excluir" ou "desativar" */
  acao?: "excluir" | "desativar";
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalConfirmacao({
  isOpen,
  acao = "excluir",
  carregando = false,
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoProps) {
  if (!isOpen) return null;

  // Define o texto dinamicamente de acordo com a ação
  const mensagem =
    acao === "desativar"
      ? "Deseja desativar o item selecionado?"
      : "Deseja excluir o item selecionado?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center mx-4 animate-fade-in">
        {/* Mensagem Dinâmica Baseada na Ação */}
        <h2 className="text-xl font-bold text-[#1e582d] mb-8 leading-snug px-4">
          {mensagem}
        </h2>

        {/* Botões de Ação */}
        <div className="flex items-center justify-center gap-4 w-full">
          {/* Botão Não (Vermelho) */}
          <button
            type="button"
            onClick={onCancelar}
            disabled={carregando}
            className="flex items-center justify-center gap-1.5 min-w-[110px] px-6 py-2.5 bg-[#d9383a] hover:bg-[#c02e30] text-white rounded-2xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs"
          >
            <MdClear size={18} />
            Não
          </button>

          {/* Botão Sim (Verde) */}
          <button
            type="button"
            onClick={onConfirmar}
            disabled={carregando}
            className="flex items-center justify-center gap-1.5 min-w-[110px] px-6 py-2.5 bg-[#2e8b45] hover:bg-[#236c35] text-white rounded-2xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs"
          >
            <MdCheck size={18} />
            {carregando ? "Processando..." : "Sim"}
          </button>
        </div>
      </div>
    </div>
  );
}