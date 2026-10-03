import { useState } from "react";

import { useRouter } from "next/router";

import { MdClear, MdCheck } from "react-icons/md";

export default function FormCadastroProfessor() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [sobreNome, setSobreNome] = useState("");
  const [email, setEmail] = useState("");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setSalvando(true);

    try {
      const resposta = await window.ipc.professor.cadastrar({
        primeiroNome: nome,
        sobrenome: sobreNome,
        email: email,
      });

      if (!resposta.success) { 
        setErro(resposta.error || "Erro ao cadastrar professor."); 
        return; 
      }

      console.log("Professor cadastrado:", resposta.data);

      router.push("/professor?sucesso=1");
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o professor.";

      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    setNome("");
    setSobreNome("");
    setEmail("");
    setErro("");

    router.push("/professor");
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Nome
          </label>

          <input
            type="text"
            required
            placeholder="Ex: Maria"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-white border border-[#cde5d3] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Sobrenome
          </label>

          <input
            type="text"
            required
            placeholder="Ex: Silva"
            value={sobreNome}
            onChange={(e) => setSobreNome(e.target.value)}
            className="w-full bg-white border border-[#cde5d3] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            E-mail
          </label>

          <input
            type="email"
            required
            placeholder="Ex: maria.silva@escola.ce.gov.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-[#cde5d3] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>
      </div>

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
