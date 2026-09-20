import Link from "next/link";

import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/Searchbar";

import { MdAdd } from "react-icons/md";

export default function GerenciarProfessores() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8">

        <h1 className="text-2xl font-bold text-black mb-6">
          Gerenciar professores
        </h1>

        <div className="flex items-center gap-12 mb-8 w-full">

          <SearchBar />

          <Link
            href="/professor/cadastro_professor"
            className="h-10 px-5 flex items-center justify-center bg-[#2e8b45] text-white rounded-full font-medium text-sm hover:bg-[#236c35] transition-colors whitespace-nowrap gap-2"
          >
            <MdAdd size={20} />
            Adicionar professor
          </Link>

        </div>

        <div className="border-2 border-[#2e8b45] rounded-[25px] p-6">
          <p className="text-gray-500 text-lg">
            Nenhum professor cadastrado.
          </p>
        </div>

      </main>
    </div>
  );
}