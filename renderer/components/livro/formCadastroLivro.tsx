// import { useRouter } from "next/router";
// import { useState } from "react";
// import { MdClear, MdCheck } from "react-icons/md";

// export default function FormCadastroLivro() {
//   const [titulo, setTitulo] = useState("");
//   const [editora, setEditora] = useState("");
//   const [quantidadeTotal, setQuantidadeTotal] = useState(1);
//   const router = useRouter();

//   function salvar(e: React.FormEvent) {
//     e.preventDefault();
//     const livro = {
//       titulo,
//       editora,
//       quantidadeTotal,
//     };

//     console.log("Livro cadastrado:", livro);
//     router.push("/livro?sucesso=1");
//   }

//   function cancelar() {
//     setTitulo("");
//     setEditora("");
//     setQuantidadeTotal(1);
//     router.push("/livro");
//   }

//   function incrementar() {
//     setQuantidadeTotal((prev) => prev + 1);
//   }

//   function decrementar() {
//     if (quantidadeTotal > 0) {
//       setQuantidadeTotal((prev) => prev - 1);
//     }
//   }

//   return (
//     <form
//       onSubmit={salvar}
//       className="w-full bg-[#eef7f0] rounded-2xl p-8 shadow-xs"
//     >
//       {/* Campos do formulário */}
//       <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
//         <div className="md:col-span-6">
//           <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
//             Título do Livro
//           </label>
//           <input
//             type="text"
//             required
//             placeholder="Ex: Dom Casmurro"
//             value={titulo}
//             onChange={(e) => setTitulo(e.target.value)}
//             className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
//           />
//         </div>

//         <div className="md:col-span-4">
//           <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
//             Editora
//           </label>
//           <input
//             type="text"
//             required
//             placeholder="Ex: Ática"
//             value={editora}
//             onChange={(e) => setEditora(e.target.value)}
//             className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
//           />
//         </div>

//         <div className="md:col-span-2">
//           <label className="text-sm font-semibold text-[#1e582d] mb-2 block whitespace-nowrap">
//             Quantidade
//           </label>
//           <div className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between shadow-2xs focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
//             <button
//               type="button"
//               onClick={decrementar}
//               disabled={quantidadeTotal <= 1}
//               className="w-9 h-9 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
//             >
//               −
//             </button>

//             <input
//               type="number"
//               min="1"
//               value={quantidadeTotal === 0 ? "" : quantidadeTotal}
//               onChange={(e) => {
//                 const val = parseInt(e.target.value, 10);
//                 setQuantidadeTotal(isNaN(val) ? 0 : Math.max(0, val));
//               }}
//               onBlur={() => {
//                 if (quantidadeTotal < 1) setQuantidadeTotal(1);
//               }}
//               className="w-12 text-center font-bold text-sm text-gray-800 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//             />

//             <button
//               type="button"
//               onClick={incrementar}
//               className="w-9 h-9 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
//             >
//               +
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Botões de ação */}
//       <div className="flex justify-end items-center gap-3">
//         <button
//           type="button"
//           onClick={cancelar}
//           className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-xs active:scale-95 cursor-pointer"
//         >
//           <MdClear size={18} />
//           Cancelar
//         </button>

//         <button
//           type="submit"
//           className="flex items-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white px-7 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
//         >
//           <MdCheck size={18} />
//           Confirmar
//         </button>
//       </div>
//     </form>
//   );
// }

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

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setSalvando(true);

    try {
      const resposta = await window.ipc.livro.cadastrar({
        titulo,
        editora,
        quantidadeTotal,
      });

      if (!resposta.success) {
        setErro(resposta.error || "Erro ao cadastrar livro.");
        return;
      }

      console.log("Livro cadastrado:", resposta.data);

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
    setQuantidadeTotal((prev) => prev + 1);
  }

  function decrementar() {
    if (quantidadeTotal > 0) {
      setQuantidadeTotal((prev) => prev - 1);
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="w-full bg-[#eef7f0] rounded-2xl p-8 shadow-xs"
    >
      {erro && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {/* Campos do formulário */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-6">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Título do Livro
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Dom Casmurro"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>

        <div className="md:col-span-4">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Editora
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Ática"
            value={editora}
            onChange={(e) => setEditora(e.target.value)}
            className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block whitespace-nowrap">
            Quantidade
          </label>
          <div className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl p-1 flex items-center justify-between shadow-2xs focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/20">
            <button
              type="button"
              onClick={decrementar}
              disabled={quantidadeTotal <= 1 || salvando}
              className="w-9 h-9 rounded-lg bg-[#eef7f0] text-[#1e582d] hover:bg-[#2e8b45] hover:text-white disabled:opacity-30 disabled:hover:bg-[#eef7f0] disabled:hover:text-[#1e582d] disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-base cursor-pointer select-none"
            >
              −
            </button>

            <input
              type="number"
              min="1"
              value={quantidadeTotal === 0 ? "" : quantidadeTotal}
              disabled={salvando}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setQuantidadeTotal(isNaN(val) ? 0 : Math.max(0, val));
              }}
              onBlur={() => {
                if (quantidadeTotal < 1) setQuantidadeTotal(1);
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

      {/* Botões de ação */}
      <div className="flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={cancelar}
          disabled={salvando}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdClear size={18} />
          Cancelar
        </button>

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white px-7 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdCheck size={18} />
          {salvando ? "Salvando..." : "Confirmar"}
        </button>
      </div>
    </form>
  );
}
