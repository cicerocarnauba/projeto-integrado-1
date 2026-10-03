import { useRouter } from "next/router";
import { useState } from "react";
import { MdCheck, MdClear } from "react-icons/md";
import { Livro } from "../../types/livro";

interface FormEditarLivroProps {
  livro: Livro;
}

export default function FormEditarLivro({ livro }: FormEditarLivroProps) {
  const router = useRouter();

  // A quantidade total não pode ficar abaixo do que já está emprestado
  // (e nunca abaixo de 1, decisão do grupo).
  const emprestados = livro.quantidadeEmprestada ?? 0;
  const minimo = Math.max(1, emprestados);

  const [titulo, setTitulo] = useState(livro.titulo);
  const [editora, setEditora] = useState(livro.editora);
  const [quantidadeTotal, setQuantidadeTotal] = useState(livro.quantidadeTotal);

  function salvar(e: React.FormEvent) {
    e.preventDefault();

    const dados = {
      titulo,
      editora,
      quantidadeTotal: Math.max(minimo, quantidadeTotal),
    };

    // Subtarefa 4: aqui entra window.ipc.livro.editar(livro.id, dados)
    console.log("Edição (ainda não salva):", livro.id, dados);
  }

  function cancelar() {
    router.push("/livro");
  }

  function incrementar() {
    setQuantidadeTotal((prev) => prev + 1);
  }

  function decrementar() {
    setQuantidadeTotal((prev) => Math.max(minimo, prev - 1));
  }

  return (
    <form
      onSubmit={salvar}
      className="w-full max-w-2xl bg-[#eef7f0] rounded-2xl p-8 shadow-xs"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-12">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Título do Livro
          </label>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>

        <div className="md:col-span-8">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Editora
          </label>
          <input
            type="text"
            required
            value={editora}
            onChange={(e) => setEditora(e.target.value)}
            className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>

        <div className="md:col-span-4">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block whitespace-nowrap">
            Exemplares
          </label>
          <div className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between shadow-2xs focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
            <button
              type="button"
              onClick={decrementar}
              disabled={quantidadeTotal <= minimo}
              className="w-9 h-9 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
            >
              −
            </button>

            <input
              type="number"
              min={minimo}
              value={quantidadeTotal === 0 ? "" : quantidadeTotal}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setQuantidadeTotal(isNaN(val) ? 0 : Math.max(0, val));
              }}
              onBlur={() => {
                if (quantidadeTotal < minimo) setQuantidadeTotal(minimo);
              }}
              className="w-12 text-center font-bold text-sm text-gray-800 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              type="button"
              onClick={incrementar}
              className="w-9 h-9 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
            >
              +
            </button>
          </div>

          {emprestados > 0 && (
            <p className="text-xs text-[#5AA365] mt-2">
              Mínimo de {minimo}: {emprestados}{" "}
              {emprestados === 1 ? "exemplar emprestado" : "exemplares emprestados"}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={cancelar}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-xs active:scale-95 cursor-pointer"
        >
          <MdClear size={18} />
          Cancelar edição
        </button>

        <button
          type="submit"
          className="flex items-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white px-7 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <MdCheck size={18} />
          Confirmar edição
        </button>
      </div>
    </form>
  );
}