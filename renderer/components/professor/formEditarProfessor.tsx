import { useRouter } from "next/router";
import { useState } from "react";
import { MdCheck, MdClear } from "react-icons/md";
import { Professor } from "../../types/professor";

import ModalEditar from "../modal/modalEditar";
interface FormEditarProfessorProps {
  professor: Professor;
}

export default function FormEditarProfessor({
  professor,
}: FormEditarProfessorProps) {
  const router = useRouter();

  const [primeiroNome, setPrimeiroNome] = useState(professor.primeiroNome);
  const [sobrenome, setSobrenome] = useState(professor.sobrenome);
  const [email, setEmail] = useState(professor.email);

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
    if (!primeiroNome.trim()) {
      return 'O campo "Primeiro nome" é obrigatório.';
    }

    if (!sobrenome.trim()) {
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

    const dados = {
      id: professor.id,
      primeiroNome: primeiroNome.trim(),
      sobrenome: sobrenome.trim(),
      email: email.trim(),
    };

    try {
      setSalvando(true);

      const resposta = await window.ipc.professor.editar(dados);

      if (resposta && resposta.success === false) {
        mostrarErro(
          resposta.error || "Erro ao salvar as alterações do professor."
        );
        return;
      }

      // Redireciona transmitindo a mensagem via query param para a listagem
      router.push({
        pathname: "/professor",
        query: { aviso: "editado" },
      });
    } catch (err: any) {
      const msg =
        err?.message ||
        "Erro ao salvar as alterações do professor. Tente novamente.";
      mostrarErro(msg);
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    router.push("/professor");
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-5">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Primeiro nome
          </label>
          <input
            type="text"
            value={primeiroNome}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setPrimeiroNome(e.target.value);
            }}
            className="w-full bg-white border border-[#cde5d3] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="md:col-span-7">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Sobrenome
          </label>
          <input
            type="text"
            value={sobrenome}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setSobrenome(e.target.value);
            }}
            className="w-full bg-white border border-[#cde5d3] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="md:col-span-12">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            disabled={salvando}
            onChange={(e) => {
              limparErro();
              setEmail(e.target.value);
            }}
            className="w-full bg-white border border-[#cde5d3] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

      <ModalEditar
        aberto={modalAberto}
        mensagem={
          <>
            Deseja salvar as alterações realizadas no professor?
          </>
        }
        onCancelar={() => setModalAberto(false)}
        onConfirmar={confirmarEdicao}
      />
    </form>
  );
}