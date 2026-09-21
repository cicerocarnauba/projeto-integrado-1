import { useState } from "react";
import { useRouter } from "next/router";
import { MdClear, MdCheck } from "react-icons/md";

export default function FormCadastroTurma() {
  const router = useRouter();
  const [nome, setNome] = useState("");

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    const turma = {
      nome,
    };

    console.log("Turma cadastrada:", turma);
    router.push("/turma?sucesso=1");
  }

  function cancelar() {
    setNome("");
    router.push("/turma");
  }

  return (
    <form
      onSubmit={salvar}
      className="w-full bg-[#eef7f0] rounded-2xl p-8 shadow-xs"
    >
      <div className="gap-6 mb-8">
        <div>
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Nome da turma
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Maternal I - A"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-white border border-[#cde5d3] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={cancelar}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-xs active:scale-95 cursor-pointer"
        >
          <MdClear size={18} />
          Cancelar
        </button>

        <button
          type="submit"
          className="flex items-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white px-7 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <MdCheck size={18} />
          Confirmar
        </button>
      </div>
    </form>
  );
}
