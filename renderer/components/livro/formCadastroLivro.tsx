import { useRouter } from "next/router";
import { useState } from "react";
import { MdClear, MdCheck } from "react-icons/md";

export default function FormCadastroLivro() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [editora, setEditora] = useState("");
  const [quantidadeTotal, setQuantidadeTotal] = useState(1);

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function limparErro() {
    if (erro) setErro("");
  }

  function validar(): string | null {
    if (!titulo.trim()) {
      return 'O campo "Título do livro" é obrigatório.';
    }

    if (!editora.trim()) {
      return 'O campo "Editora" é obrigatório.';
    }

    if (!Number.isInteger(quantidadeTotal) || quantidadeTotal < 1) {
      return "A quantidade de exemplares deve ser um número inteiro maior ou igual a 1.";
    }

    return null;
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    limparErro();

    const mensagemErro = validar();
    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    setSalvando(true);

    try {
      const resposta = await window.ipc.livro.cadastrar({
        titulo: titulo.trim(),
        editora: editora.trim(),
        quantidadeTotal,
      });

      if (!resposta.success) {
        setErro(resposta.error || "Erro ao cadastrar livro.");
        return;
      }

      router.push("/livro?sucesso=1");
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o livro.";

      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    setTitulo("");
    setEditora("");
    setQuantidadeTotal(1);
    setErro("");
    router.push("/livro");
  }

  function incrementar() {
    limparErro();
    setQuantidadeTotal((prev) => prev + 1);
  }

  function decrementar() {
    limparErro();
    if (quantidadeTotal > 1) {
      setQuantidadeTotal((prev) => prev - 1);
    }
  }

  return (
    <form
      onSubmit={salvar}
      noValidate
      className="w-full bg-[#eef7f0] border border-[#cfe5d4] rounded-2xl p-5 sm:p-6 xl:p-8 shadow-xs"
    >
      {erro && (
        <div
          role="alert"
          className="mb-4 xl:mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 xl:py-3.5 text-sm xl:text-base text-red-700"
        >
          {erro}
        </div>
      )}

      {/* Campos do formulário */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 xl:gap-6 mb-5 xl:mb-6">
        <div className="md:col-span-12">
          <label className="text-sm xl:text-base font-semibold text-[#1e582d] mb-1.5 xl:mb-2 block">
            Título do livro <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Dom Casmurro"
            value={titulo}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setTitulo(e.target.value);
            }}
            className="w-full h-10 xl:h-12 bg-white border border-[#cde5d3] rounded-xl px-3.5 xl:px-4 text-sm xl:text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60"
          />
        </div>

        <div className="md:col-span-8">
          <label className="text-sm xl:text-base font-semibold text-[#1e582d] mb-1.5 xl:mb-2 block">
            Editora <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Ática"
            value={editora}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setEditora(e.target.value);
            }}
            className="w-full h-10 xl:h-12 bg-white border border-[#cde5d3] rounded-xl px-3.5 xl:px-4 text-sm xl:text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60"
          />
        </div>

        <div className="md:col-span-4">
          <label className="text-sm xl:text-base font-semibold text-[#1e582d] mb-1.5 xl:mb-2 block whitespace-nowrap">
            Exemplares <span className="text-red-500">*</span>
          </label>
          <div className="w-full h-10 xl:h-12 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between shadow-2xs focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
            <button
              type="button"
              onClick={decrementar}
              disabled={quantidadeTotal <= 1 || salvando}
              className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base xl:text-lg cursor-pointer select-none"
            >
              −
            </button>

            <input
              type="number"
              min="1"
              value={quantidadeTotal === 0 ? "" : quantidadeTotal}
              disabled={salvando}
              onChange={(e) => {
                limparErro();
                const val = parseInt(e.target.value, 10);
                setQuantidadeTotal(isNaN(val) ? 0 : Math.max(0, val));
              }}
              onBlur={() => {
                if (quantidadeTotal < 1) setQuantidadeTotal(1);
              }}
              className="w-14 text-center font-bold text-sm xl:text-base text-gray-900 tabular-nums outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              type="button"
              onClick={incrementar}
              disabled={salvando}
              className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white transition-colors flex items-center justify-center font-bold text-base xl:text-lg cursor-pointer select-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Efeito em tempo real da quantidade escolhida */}
      <div className="mb-6 xl:mb-8 space-y-3">
        <p className="text-sm xl:text-base text-[#245B2F]">
          Exemplares disponíveis para empréstimo:{" "}
          <span className="font-bold tabular-nums">{quantidadeTotal}</span>
        </p>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={cancelar}
          disabled={salvando}
          className="h-10 xl:h-11 inline-flex items-center justify-center gap-2 px-5 xl:px-6 rounded-xl text-sm xl:text-base font-semibold text-white bg-[#cf4a4a] hover:bg-[#b83a3a] transition-colors shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdClear size={19} />
          Cancelar
        </button>

        <button
          type="submit"
          disabled={salvando}
          className="h-10 xl:h-11 inline-flex items-center justify-center gap-2 bg-[#2e8b45] hover:bg-[#236c35] text-white px-6 xl:px-7 rounded-xl text-sm xl:text-base font-semibold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdCheck size={19} />
          {salvando ? "Salvando..." : "Confirmar"}
        </button>
      </div>
    </form>
  );
}
