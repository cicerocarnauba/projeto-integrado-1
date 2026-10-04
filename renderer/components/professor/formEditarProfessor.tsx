import { useRouter } from "next/router";
import { useState } from "react";
import { MdCheck, MdClear } from "react-icons/md";
import { Professor } from "../../types/professor";


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

  function salvar(e: React.FormEvent) {
    e.preventDefault();

    const dados = {
      id: professor.id,
      primeiroNome: primeiroNome.trim(),
      sobrenome: sobrenome.trim(),
      email: email.trim(),
    };

    // Subtarefa 4: aqui entra window.ipc.professor.editar(dados)
    console.log("Edição (ainda não salva):", dados);
  }

  function cancelar() {
    router.push("/professor");
  }

  return (
    <form
      onSubmit={salvar}
      className="w-full bg-[#eef7f0] rounded-2xl p-8 shadow-xs"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-5">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Primeiro nome
          </label>
          <input
            type="text"
            required
            value={primeiroNome}
            onChange={(e) => setPrimeiroNome(e.target.value)}
            className="w-full bg-white border border-[#cde5d3] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>

        <div className="md:col-span-7">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            Sobrenome
          </label>
          <input
            type="text"
            required
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            className="w-full bg-white border border-[#cde5d3] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#2e8b45] focus:ring-2 focus:ring-[#2e8b45]/20"
          />
        </div>

        <div className="md:col-span-12">
          <label className="text-sm font-semibold text-[#1e582d] mb-2 block">
            E-mail
          </label>
          <input
            type="email"
            required
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
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-xs active:scale-95 cursor-pointer"
        >
          <MdClear size={18} />
          Cancelar edição
        </button>

        <button
          type="submit"
          className="flex items-center gap-1.5 bg-[#2e8b45] hover:bg-[#236c35] text-white px-7 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <MdCheck size={18} />
          Confirmar edição
        </button>
      </div>
    </form>
  );
}