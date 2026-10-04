import { useState } from "react";
import { MdCheck, MdClear } from "react-icons/md";
import { Livro } from "../../types/livro";


interface ModalAtivarLivroProps {
  /** Livro a ser ativado. Com null, o modal fica fechado. */
  livro: Livro | null;
  carregando?: boolean;
  /** Erro vindo do backend (usado na integração) */
  erro?: string;
  onConfirmar: (quantidadeTotal: number) => void;
  onCancelar: () => void;
}

export default function ModalAtivarLivro({
  livro,
  carregando = false,
  erro = "",
  onConfirmar,
  onCancelar,
}: ModalAtivarLivroProps) {
  if (!livro) return null;

  return (
    <ConteudoModal
      key={livro.id}
      livro={livro}
      carregando={carregando}
      erro={erro}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    />
  );
}

function ConteudoModal({
  livro,
  carregando,
  erro,
  onConfirmar,
  onCancelar,
}: Omit<ModalAtivarLivroProps, "livro"> & { livro: Livro }) {
  // A quantidade total não pode ficar abaixo do que já está emprestado
  // (e nunca abaixo de 1).
  const emprestados = livro.quantidadeEmprestada ?? 0;
  const minimo = Math.max(1, emprestados);

  // Começa vazio de propósito: a HU06 exige que a bibliotecária informe a quantidade
  const [quantidade, setQuantidade] = useState("");
  const [erroLocal, setErroLocal] = useState("");

  function validar(): number | null {
    if (quantidade.trim() === "") {
      setErroLocal(
        "Informe a nova quantidade de exemplares para ativar o livro.",
      );
      return null;
    }

    const valor = Number(quantidade);

    if (!Number.isInteger(valor) || valor <= 0) {
      setErroLocal("A quantidade deve ser um número maior que zero.");
      return null;
    }

    if (valor < emprestados) {
      setErroLocal(
        `A quantidade não pode ser menor que ${emprestados} ${
          emprestados === 1 ? "exemplar emprestado" : "exemplares emprestados"
        } no momento.`,
      );
      return null;
    }

    return valor;
  }

  function confirmar() {
    setErroLocal("");
    const valor = validar();
    if (valor !== null) onConfirmar(valor);
  }

  function incrementar() {
    setErroLocal("");
    const atual = Number(quantidade);
    setQuantidade(
      quantidade.trim() === "" || isNaN(atual)
        ? String(minimo)
        : String(atual + 1),
    );
  }

  function decrementar() {
    setErroLocal("");
    const atual = Number(quantidade);
    if (quantidade.trim() === "" || isNaN(atual)) return;
    setQuantidade(String(Math.max(minimo, atual - 1)));
  }


  const mensagemErro = erroLocal || erro;
  const valorAtual = Number(quantidade);
  const semValor = quantidade.trim() === "" || isNaN(valorAtual);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl mx-4 animate-fade-in"
      >
        <h2 className="text-xl font-bold text-[#1e582d] mb-6 text-center leading-snug">
          Informe a nova quantidade para ativar o livro
        </h2>

        {mensagemErro && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {mensagemErro}
          </div>
        )}

        {/* Dados do livro, no estilo do card da listagem (livro inativo) */}
        <div className="rounded-2xl bg-[#f8faf9] border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between gap-2">
            <h3
              title={livro.titulo}
              className="text-sm font-bold text-gray-700 line-clamp-1 pr-1"
            >
              {livro.titulo}
            </h3>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs shrink-0 bg-gray-200/80 text-gray-600 border border-gray-300">
              <span className="w-2 h-2 rounded-full shrink-0 bg-gray-400" />
              Inativo
            </span>
          </div>

          <p className="text-xs mt-2 line-clamp-1 text-gray-500">
            Editora: <span className="text-gray-600">{livro.editora}</span>
          </p>
        </div>

        {/* Campo da nova quantidade */}
        <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
          Nova quantidade total de exemplares
        </label>
        <div className="w-full h-12 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between shadow-2xs focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
          <button
            type="button"
            onClick={decrementar}
            disabled={carregando || semValor || valorAtual <= minimo}
            className="w-10 h-10 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
          >
            −
          </button>

          <input
            type="number"
            min={minimo}
            placeholder="0"
            value={quantidade}
            disabled={carregando}
            onChange={(e) => {
              setErroLocal("");
              setQuantidade(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmar();
            }}
            className="w-full text-center font-bold text-base text-gray-800 outline-none bg-transparent placeholder:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            type="button"
            onClick={incrementar}
            disabled={carregando}
            className="w-10 h-10 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {emprestados > 0 && (
          <p className="text-xs text-[#5AA365] mt-2">
            Mínimo de {minimo}: {emprestados}{" "}
            {emprestados === 1
              ? "exemplar emprestado"
              : "exemplares emprestados"}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 w-full mt-8">
          <button
            type="button"
            onClick={onCancelar}
            disabled={carregando}
            className="flex items-center justify-center gap-1.5 min-w-[110px] px-6 py-2.5 bg-[#d9383a] hover:bg-[#c02e30] text-white rounded-2xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs"
          >
            <MdClear size={18} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmar}
            disabled={carregando}
            className="flex items-center justify-center gap-1.5 min-w-[110px] px-6 py-2.5 bg-[#2e8b45] hover:bg-[#236c35] text-white rounded-2xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs"
          >
            <MdCheck size={18} />
            {carregando ? "Ativando..." : "Ativar"}
          </button>
        </div>
      </div>
    </div>
  );
}
