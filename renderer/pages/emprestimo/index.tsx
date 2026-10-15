import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar";
import { MdAdd } from "react-icons/md";

// Versão MÍNIMA e provisória de /emprestimo, só para dar acesso ao formulário
// de "Realizar empréstimo". A listagem completa vai substituir este arquivo.
export default function GerenciarEmprestimos() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-8 flex flex-col animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">
            Gerenciar empréstimos
          </h1>

          <button
            type="button"
            onClick={() => router.push("/emprestimo/novo")}
            className="flex items-center gap-1.5 bg-[#2e8b45] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer"
          >
            <MdAdd size={18} />
            Realizar empréstimo
          </button>
        </div>

        <div className="w-full bg-[#eef7f0] rounded-2xl p-12 text-center text-[#1e582d]">
          <p className="text-base font-medium">
            Nenhum empréstimo realizado ainda.
          </p>
        </div>
      </main>
    </div>
  );
}
