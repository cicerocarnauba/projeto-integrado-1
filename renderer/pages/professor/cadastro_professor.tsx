import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import FormCadastroProfessor from "../../components/professor/formCadastroProfessor";
import { MdArrowBack } from "react-icons/md";


export default function GerenciarProfessores() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <p className="text-2xl font-bold text-black mb-6">
          Gerenciar professores
        </p>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Adicionar professor</h1>

          <Link
            href="/professor"
            className="flex items-center gap-1 bg-[#2e8b45] text-white px-4 py-2 rounded-4xl text-sm font-medium hover:bg-[#236c35] transition-colors"
          >
            <MdArrowBack size={20}/>
            Voltar
          </Link>
        </div>

        <FormCadastroProfessor />
      </main>
    </div>
  );
}