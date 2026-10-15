import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdAdd, MdCheck, MdClear } from "react-icons/md";

// Item da lista "Livros selecionados" (será preenchido na subtarefa 3)
export interface ItemSelecionado {
  livroId: number;
  titulo: string;
  quantidade: number;
}

const inputBase =
  "w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60";

export default function FormRealizarEmprestimo() {
  const router = useRouter();

  const [professorId, setProfessorId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [livroId, setLivroId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [itens] = useState<ItemSelecionado[]>([]);

  // A data do empréstimo é sempre a data atual do sistema (não editável).
  // Calculada no cliente para evitar diferença entre servidor e navegador.
  const [dataHoje, setDataHoje] = useState("");
  useEffect(() => {
    setDataHoje(new Date().toLocaleDateString("pt-BR"));
  }, []);

  const podeAdicionar = livroId !== "";
  const podeConfirmar =
    professorId !== "" && turmaId !== "" && itens.length > 0;

  function cancelar() {
    router.push("/emprestimo");
  }

  function incrementar() {
    setQuantidade((prev) => prev + 1);
  }

  function decrementar() {
    setQuantidade((prev) => Math.max(1, prev - 1));
  }

  return (
    <form
      noValidate
      onSubmit={(e) => e.preventDefault()}
      className="w-full bg-[#eef7f0] rounded-2xl p-8 shadow-xs"
    >
      {/* Professor, turma e data */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-[#cde5d3]">
        <div className="md:col-span-5">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Professor <span className="text-red-500">*</span>
          </label>
          <select
            value={professorId}
            onChange={(e) => setProfessorId(e.target.value)}
            className={inputBase}
          >
            <option value="">Selecione o professor...</option>
          </select>
        </div>

        <div className="md:col-span-4">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Turma <span className="text-red-500">*</span>
          </label>
          <select
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className={inputBase}
          >
            <option value="">Selecione a turma...</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Data do Empréstimo
          </label>
          <input
            type="text"
            value={dataHoje}
            disabled
            readOnly
            className={`${inputBase} bg-[#f4faf5] text-gray-700`}
          />
        </div>
      </div>

      {/* Adicionar livros */}
      <div className="pt-6">
        <h2 className="text-sm font-bold text-[#1e582d] mb-3">
          Adicionar Livros ao Empréstimo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-7">
            <label className="text-xs font-semibold text-[#1e582d] mb-2 block">
              Livro
            </label>
            <select
              value={livroId}
              onChange={(e) => setLivroId(e.target.value)}
              className={inputBase}
            >
              <option value="">Selecione o livro...</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-[#1e582d] mb-2 block">
              Quantidade
            </label>
            <div className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
              <button
                type="button"
                onClick={decrementar}
                disabled={quantidade <= 1}
                className="w-8 h-8 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
              >
                −
              </button>

              <input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantidade(isNaN(val) ? 1 : Math.max(1, val));
                }}
                className="w-10 text-center font-bold text-sm text-gray-800 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                type="button"
                onClick={incrementar}
                className="w-8 h-8 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
              >
                +
              </button>
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              disabled={!podeAdicionar}
              className="w-full h-11 flex items-center justify-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white rounded-xl text-sm font-medium transition-all active:scale-95 cursor-pointer disabled:bg-[#9cc9a8] disabled:hover:bg-[#9cc9a8] disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              <MdAdd size={18} />
              Adicionar Livro
            </button>
          </div>
        </div>
      </div>

      {/* Livros selecionados */}
      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#1e582d] mb-2">
          Livros selecionados ({itens.length})
        </p>

        <div className="w-full bg-[#f7fbf8] border border-[#cde5d3] rounded-xl">
          {itens.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[#5AA365]">
              Nenhum livro adicionado ao empréstimo ainda.
            </p>
          ) : (
            <ul>{/* Lista de itens: subtarefa 3 */}</ul>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end items-center gap-3 mt-6">
        <button
          type="button"
          onClick={cancelar}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[#cf4a4a] hover:bg-red-600 transition-colors shadow-xs active:scale-95 cursor-pointer"
        >
          <MdClear size={18} />
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!podeConfirmar}
          className="flex items-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white px-7 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer disabled:bg-[#9cc9a8] disabled:hover:bg-[#9cc9a8] disabled:active:scale-100 disabled:cursor-not-allowed"
        >
          <MdCheck size={18} />
          Confirmar Empréstimo
        </button>
      </div>
    </form>
  );
}
