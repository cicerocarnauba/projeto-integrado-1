import { useState } from "react";
import { useRouter } from "next/router";
import { MdClear, MdCheck } from "react-icons/md";

export default function FormCadastroTurma() {
  const router = useRouter();

  const [nome, setNome] = useState("");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function limparErro() {
    if (erro) setErro("");
  }

  function validar(): string | null {
    if (!nome.trim()) {
      return 'O campo "Nome da turma" é obrigatório.';
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
      const resposta = await window.ipc.turma.cadastrar({
        nome: nome.trim(),
      });

      if (!resposta.success) {
        setErro(resposta.error || "Não foi possível cadastrar turma.");
        return;
      }

      router.push("/turma?sucesso=1");
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar turma.";

      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    setNome("");
    setErro("");

    router.push("/turma");
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

      <div className="mb-6 xl:mb-8">
        <div>
          <label className="text-sm xl:text-base font-semibold text-[#1e582d] mb-1.5 xl:mb-2 block">
            Nome da turma <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Maternal I - A"
            value={nome}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setNome(e.target.value);
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
