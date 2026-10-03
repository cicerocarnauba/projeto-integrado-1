import { useRouter } from "next/router";
import { useState } from "react";
import { MdCheck, MdClear } from "react-icons/md";
import { Livro } from "../../types/livro";

interface FormEditarLivroProps {
  livro: Livro;
}

export default function FormEditarLivro({ livro }: FormEditarLivroProps) {
  const router = useRouter();

  // O campo edita a quantidade TOTAL. O total não pode ficar abaixo do que
  // já está emprestado. Sem nada emprestado, pode chegar a zero (o livro
  // vira "Inativo" automaticamente, regra da HU02 aplicada pelo backend).
  const emprestados = livro.quantidadeEmprestada ?? 0;
  const minimo = emprestados;

  const [titulo, setTitulo] = useState(livro.titulo);
  const [editora, setEditora] = useState(livro.editora);
  const [quantidadeTotal, setQuantidadeTotal] = useState(livro.quantidadeTotal);

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Saldo que ficaria disponível para empréstimo com a quantidade digitada
  const disponiveis = Math.max(0, quantidadeTotal - emprestados);

  function mostrarErro(mensagem: string) {
    setErro(mensagem);
  }

  function limparErro() {
    if (erro) setErro("");
  }

  function validar(): string | null {
    if (!titulo.trim()) {
      return 'O campo "Título" é obrigatório.';
    }

    if (!editora.trim()) {
      return 'O campo "Editora" é obrigatório.';
    }

    if (!Number.isInteger(quantidadeTotal) || quantidadeTotal < 0) {
      return "A quantidade de exemplares deve ser um número inteiro, zero ou maior.";
    }

    if (quantidadeTotal < emprestados) {
      return `A quantidade não pode ser menor que ${emprestados} ${
        emprestados === 1 ? "exemplar emprestado" : "exemplares emprestados"
      } no momento.`;
    }

    return null;
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    limparErro();

    const mensagemErro = validar();

    if (mensagemErro) {
      mostrarErro(mensagemErro);
      return;
    }

    setSalvando(true);

    try {
      const resposta = await window.ipc.livro.editar(livro.id, {
        titulo: titulo.trim(),
        editora: editora.trim(),
        quantidadeTotal,
      });

      // Erros do backend
      if (!resposta.success) {
        mostrarErro(resposta.error || "Erro ao editar o livro.");
        return;
      }

      const desativado = resposta.data?.status === "INATIVO";

      router.push(
        desativado ? "/livro?sucesso=editado_inativo" : "/livro?sucesso=editado"
      );
    } catch (error) {
      mostrarErro(
        error instanceof Error
          ? error.message
          : "Não foi possível editar o livro."
      );
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    router.push("/livro");
  }

  function incrementar() {
    limparErro();
    setQuantidadeTotal((prev) => prev + 1);
  }

  function decrementar() {
    limparErro();
    setQuantidadeTotal((prev) => Math.max(minimo, prev - 1));
  }

  return (
    <form
      onSubmit={salvar}
      noValidate
      className="w-full max-w-2xl bg-[#eef7f0] rounded-2xl p-8 shadow-xs"
    >
      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-12">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Título do Livro
          </label>
          <input
            type="text"
            value={titulo}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setTitulo(e.target.value);
            }}
            className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60"
          />
        </div>

        <div className="md:col-span-8">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Editora
          </label>
          <input
            type="text"
            value={editora}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setEditora(e.target.value);
            }}
            className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60"
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
              disabled={quantidadeTotal <= minimo || salvando}
              className="w-9 h-9 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
            >
              −
            </button>

            <input
              type="number"
              min={minimo}
              value={quantidadeTotal}
              disabled={salvando}
              onChange={(e) => {
                limparErro();
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
              disabled={salvando}
              className="w-9 h-9 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Efeito em tempo real da quantidade escolhida */}
      <div className="mb-8 space-y-3">
        <p className="text-sm text-[#245B2F]">
          Disponíveis para empréstimo:{" "}
          <span className="font-bold">{disponiveis}</span>
          {emprestados > 0 && (
            <span className="text-[#5AA365]">
              {" "}
              ({emprestados}{" "}
              {emprestados === 1 ? "emprestado" : "emprestados"})
            </span>
          )}
        </p>

        {quantidadeTotal === 0 && (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Com 0 exemplares, o livro será desativado automaticamente ao
            confirmar.
          </div>
        )}
      </div>

      <div className="flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={cancelar}
          disabled={salvando}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdClear size={18} />
          Cancelar edição
        </button>

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white px-7 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdCheck size={18} />
          {salvando ? "Salvando..." : "Confirmar edição"}
        </button>
      </div>
    </form>
  );
}