import Link from "next/link";
import { useRouter } from "next/router";

import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/Searchbar";

import { MdAdd, MdPersonOutline } from "react-icons/md";

export default function GerenciarProfessores() {
  const router = useRouter();
  const mostrarSucesso = router.query.sucesso === "1";

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Gerenciar professores
        </h1>

        {mostrarSucesso && (
          <div className="bg-[#d8f3dc] text-[#2e8b45] px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
            ✓ Professor cadastrado com sucesso!
          </div>
        )}

        {/* Barra de busca e botão de adicionar */}
        <div className="flex items-center gap-4 mb-8 w-full">
          <SearchBar placeholder="Pesquisar professor por nome ou e-mail..." />

          <Link
            href="/professor/cadastro_professor"
            className="h-11 px-6 flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-medium text-sm hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer"
          >
            <MdAdd size={18} />
            Adicionar professor
          </Link>
        </div>

        {/* Lista de professores */}
        <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
          <p className="text-base font-medium">
            Nenhum professor cadastrado.
          </p>
        </div>
      </main>
    </div>
  );
}