import { useState } from "react";

export default function FormCadastroLivro() {
  const [titulo, setTitulo] = useState("");
  const [editora, setEditora] = useState("");
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);

  function salvar() {
    const livro = {
      titulo,
      editora,
      quantidadeTotal,
    };

    console.log(livro);
  }

  function cancelar() {
    setTitulo("");
    setEditora("");
    setQuantidadeTotal(0);
  }

  function incrementar() {
    setQuantidadeTotal(quantidadeTotal + 1);
  }

  function decrementar() {
    if (quantidadeTotal > 0) {
      setQuantidadeTotal(quantidadeTotal - 1);
    }
  }

  return (
    <div className="border-2 border-[#2e8b45] rounded-3xl p-6 max-w-2xl">
      <div className="mb-4">
        <label className="text-xs text-gray-600 mb-1 block">
          Título do Livro
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#2e8b45]"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Editora</label>
          <input
            type="text"
            value={editora}
            onChange={(e) => setEditora(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#2e8b45]"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Total de exemplares
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={decrementar}
              className="w-7 h-7 rounded-full bg-[#2e8b45] text-white flex items-center justify-center hover:bg-[#236c35]"
            >
              -
            </button>
            <span className="text-sm font-medium w-4 text-center">
              {quantidadeTotal}
            </span>
            <button
              onClick={incrementar}
              className="w-7 h-7 rounded-full bg-[#2e8b45] text-white flex items-center justify-center hover:bg-[#236c35]"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={cancelar}
          className="flex items-center gap-1 bg-red-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
        >
          ✕ Cancelar
        </button>

        <button
          onClick={salvar}
          className="flex items-center gap-1 bg-[#2e8b45] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#236c35] transition-colors"
        >
          ✓ Confirmar
        </button>
      </div>
    </div>
  );
}
