import { useState } from "react";
import { MdCheck, MdClear } from "react-icons/md";
import { Livro } from "../../types/livro";

interface ModalAtivarLivroProps {
  /** Livro a ser ativado. Com null, o modal fica fechado. */
  livro: Livro | null;

  carregando?: boolean;

  /** Erro vindo do backend */
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

  // A quantidade total não pode ficar abaixo do que já está emprestado
  // e nunca pode ser menor que 1.
  const emprestados = livro.quantidadeEmprestada ?? 0;
  const minimo = Math.max(1, emprestados);

  const [quantidade, setQuantidade] = useState("");
  const [erroLocal, setErroLocal] = useState("");

  function validar(): number | null {
    if (quantidade.trim() === "") {
      setErroLocal(
        "Informe a nova quantidade de exemplares para ativar o livro."
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
          emprestados === 1
            ? "exemplar emprestado"
            : "exemplares emprestados"
        } no momento.`
      );
      return null;
    }

    return valor;
  }

  function confirmar() {
    setErroLocal("");

    const valor = validar();

    if (valor !== null) {
      onConfirmar(valor);
    }
  }

  function incrementar() {
    setErroLocal("");

    const atual = Number(quantidade);

    setQuantidade(
      quantidade.trim() === "" || isNaN(atual)
        ? String(minimo)
        : String(atual + 1)
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !carregando) onCancelar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white border border-[#dcece0] rounded-2xl shadow-2xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-900">Ativar livro?</h2>

        <p className="mt-2 text-[15px] text-gray-600 leading-relaxed">
          Informe a nova quantidade total de exemplares:
        </p>

        <div className="mt-3 rounded-xl bg-[#eef7f0] border border-[#d5ead9] p-3.5 space-y-1 text-[14.5px]">
          <p>
            <span className="font-semibold text-[#1e582d]">Título: </span>
            <span className="text-gray-800">{livro.titulo}</span>
          </p>
          <p>
            <span className="font-semibold text-[#1e582d]">Editora: </span>
            <span className="text-gray-800">{livro.editora}</span>
          </p>
        </div>

        {mensagemErro && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14.5px] text-red-700"
          >
            {mensagemErro}
          </div>
        )}

        <label className="text-[15px] font-semibold text-[#1e582d] mt-5 mb-2 block">
          Nova quantidade total de exemplares
        </label>

        <div className="w-full h-12 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between shadow-2xs focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
          <button
            type="button"
            onClick={decrementar}
            disabled={carregando || semValor || valorAtual <= minimo}
            className="w-10 h-10 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-lg cursor-pointer select-none"
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
            className="w-full text-center font-bold text-base text-gray-900 tabular-nums outline-none bg-transparent placeholder:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            type="button"
            onClick={incrementar}
            disabled={carregando}
            className="w-10 h-10 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white transition-colors flex items-center justify-center font-bold text-lg cursor-pointer select-none disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {emprestados > 0 && (
          <p className="text-[13.5px] font-medium text-[#2e8b45] mt-2">
            Mínimo de {minimo}: {emprestados}{" "}
            {emprestados === 1
              ? "exemplar emprestado"
              : "exemplares emprestados"}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            disabled={carregando}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-[14.5px] font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <MdClear size={17} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmar}
            disabled={carregando}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-[14.5px] font-semibold text-white bg-[#2e8b45] hover:bg-[#236c35] transition-colors cursor-pointer disabled:opacity-50"
          >
            <MdCheck size={17} />
            {carregando ? "Ativando..." : "Ativar"}
          </button>
        </div>
      </div>
    </div>
  );
}
