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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-gray-800">
          Ativar livro?
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Informe a nova quantidade total de exemplares:
        </p>

        <div className="mt-4 rounded-xl bg-[#eef7f0] p-4">
          <span className="block font-bold text-gray-800 text-xs mt-0.75">
            Título:{" "}
            <span className="text-sm font-normal text-gray-600">
              {livro.titulo}
            </span>
          </span>
            <span className="block font-bold text-gray-800 text-xs">
            Editora:{" "}
            <span className="text-sm font-normal text-gray-600">
              {livro.editora} 
            </span>
          </span>
        </div>

        {mensagemErro && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {mensagemErro}
          </div>
        )}

        <label className="text-sm font-semibold text-[#1e582d] mt-5 mb-2 block">
          Nova quantidade total de exemplares
        </label>

        <div className="w-full h-12 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between shadow-2xs focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
          <button
            type="button"
            onClick={decrementar}
            disabled={
              carregando ||
              semValor ||
              valorAtual <= minimo
            }
            className="w-10 h-10 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
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

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            disabled={carregando}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <MdClear size={16} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmar}
            disabled={carregando}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#2e8b45] hover:bg-[#236c35] transition-colors cursor-pointer disabled:opacity-50"
          >
            <MdCheck size={16} />
            {carregando ? "Ativando..." : "Ativar"}
          </button>
        </div>
      </div>
    </div>
  );
}
