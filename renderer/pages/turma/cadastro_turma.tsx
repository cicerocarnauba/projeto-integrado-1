import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import FormCadastroTurma from "../../components/turma/formCadastroTurma";
import { MdArrowBack } from "react-icons/md";


export default function GerenciarTurmas() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Adicionar turma</h1>

          <Link
            href="/turma"
            className="flex items-center gap-1.5 bg-[#2e8b45] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer"
          >
            <MdArrowBack size={18}/>
            Voltar
          </Link>
        </div>

        < FormCadastroTurma/>
      </main>
    </div>
  );
}