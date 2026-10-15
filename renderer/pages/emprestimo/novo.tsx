import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar";
import FormRealizarEmprestimo from "../../components/emprestimo/formRealizarEmprestimo";
import { MdArrowBack } from "react-icons/md";

// Rota: /emprestimo/novo
export default function RealizarEmprestimo() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-8 flex flex-col animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Realizar empréstimo</h1>

          <button
            type="button"
            onClick={() => router.push("/emprestimo")}
            className="flex items-center gap-1.5 bg-[#2e8b45] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer"
          >
            <MdArrowBack size={18} />
            Voltar
          </button>
        </div>

        <div>
          <FormRealizarEmprestimo />
        </div>
      </main>
    </div>
  );
}
