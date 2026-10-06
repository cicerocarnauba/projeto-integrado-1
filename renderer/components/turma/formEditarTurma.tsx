import { useRouter } from "next/router";
import { useState } from "react";
import { MdCheck, MdClear } from "react-icons/md";
import { Turma } from "../../types/turma";
import ModalEditar from "../modal/modalEditar";

interface FormEditarTurmaProps {
  turma: Turma;
}

export default function FormEditarTurma({ turma }: FormEditarTurmaProps) {
    const router = useRouter();

    const [nome, setNome] = useState(turma.nome);

    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    const [modalAberto, setModalAberto] = useState(false);


    function mostrarErro(mensagem: string) {
        setErro(mensagem);
    }

    function limparErro() {
        if (erro) setErro("");
    }

    function validar(): string | null {
        if (!nome.trim()) {
        return 'O campo "Nome" é obrigatório.';
        }

        return null;
    }

    function salvar(e: React.FormEvent) {
      e.preventDefault();
      limparErro();

      const mensagemErro = validar();

      if (mensagemErro) {
        mostrarErro(mensagemErro);
        return;
      }

      setModalAberto(true);
    }

    async function confirmarEdicao() {
      setModalAberto(false);

      setSalvando(true);

      try {
        const resposta = await window.ipc.turma.editar({
          id: turma.id,
          nome: nome.trim()
        });

        if (!resposta.success) {
          mostrarErro(resposta.error || "Erro ao editar a turma.");
          return;
        }

        const desativado = resposta.data?.status === "INATIVO";

        router.push(
          desativado ? "/turma?sucesso=editado_inativo" : "/turma?sucesso=editado"
        );
      } catch (error) {
        mostrarErro(
          error instanceof Error
          ? error.message
          : "Não foi possível editar a turma."
        );
      } finally {
        setSalvando(false);
      }
    }


      
  function cancelar() {
    router.push("/turma");
  }

  return (
    <form
      onSubmit={salvar}
      noValidate
      className="w-full bg-[#eef7f0] rounded-2xl p-8 shadow-xs"
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
            Nome da turma
          </label>
          <input
            type="text"
            value={nome}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setNome(e.target.value);
            }}
            className="w-full h-11 bg-white border border-[#cde5d3] rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:opacity-60"
          />
        </div>
    </div>


      <div className="flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={cancelar}
          disabled={salvando}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[#cf4a4a] hover:bg-[#b83a3a] transition-colors shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdClear size={16} />
          Cancelar edição
        </button>

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white px-7 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdCheck size={16} />
          {salvando ? "Salvando..." : "Confirmar edição"}
        </button>
      </div>

      <ModalEditar
        aberto={modalAberto}
        mensagem={
          <>
            Deseja salvar as alterações da turma:
            <span className="block font-bold text-[#2e8b45]">
              {nome}
            </span>
          </>
        }
        onCancelar={() => setModalAberto(false)}
        onConfirmar={confirmarEdicao}
      />
    </form>
  );
}