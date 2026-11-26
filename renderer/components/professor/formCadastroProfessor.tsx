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

  function limparErro() {
    if (erro) setErro("");
  }

  function validar(): string | null {
    if (!nome.trim()) {
      return 'O campo "Primeiro nome" é obrigatório.';
    }

    if (!sobreNome.trim()) {
      return 'O campo "Sobrenome" é obrigatório.';
    }

    if (!email.trim()) {
      return 'O campo "E-mail" é obrigatório.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Informe um e-mail válido.";
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
      const resposta = await window.ipc.professor.cadastrar({
        primeiroNome: nome.trim(),
        sobrenome: sobreNome.trim(),
        email: email.trim(),
      });

      if (!resposta.success) {
        setErro(resposta.error || "Erro ao cadastrar professor.");
        return;
      }

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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 xl:gap-6 mb-6 xl:mb-8">
        <div className="md:col-span-5">
          <label className="text-sm xl:text-base font-semibold text-[#1e582d] mb-1.5 xl:mb-2 block">
            Primeiro nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Maria"
            value={nome}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setNome(e.target.value);
            }}
            className="w-full h-10 xl:h-12 bg-white border border-[#cde5d3] rounded-xl px-3.5 xl:px-4 text-sm xl:text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60"
          />
        </div>

        <div className="md:col-span-7">
          <label className="text-sm xl:text-base font-semibold text-[#1e582d] mb-1.5 xl:mb-2 block">
            Sobrenome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Silva"
            value={sobreNome}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setSobreNome(e.target.value);
            }}
            className="w-full h-10 xl:h-12 bg-white border border-[#cde5d3] rounded-xl px-3.5 xl:px-4 text-sm xl:text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60"
          />
        </div>

        <div className="md:col-span-12">
          <label className="text-sm xl:text-base font-semibold text-[#1e582d] mb-1.5 xl:mb-2 block">
            E-mail <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="Ex: maria.silva@escola.ce.gov.br"
            value={email}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setEmail(e.target.value);
            }}
            className="w-full h-10 xl:h-12 bg-white border border-[#cde5d3] rounded-xl px-3.5 xl:px-4 text-sm xl:text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60"
          />
        </div>
      </div>

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
