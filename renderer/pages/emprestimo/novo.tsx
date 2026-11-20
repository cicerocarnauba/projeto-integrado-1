import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar";
import FormRealizarEmprestimo from "../../components/emprestimo/formRealizarEmprestimo";
import { MdArrowBack } from "react-icons/md";

// Rota: /emprestimo/novo
export default function RealizarEmprestimo() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-[#f8fbf9]">
      <Sidebar />

      <main className="flex-1 min-w-0 px-8 lg:px-10 py-7 flex flex-col animate-fade-in">
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-gray-900">
              Realizar empréstimo
            </h1>

            <button
              type="button"
              onClick={() => router.push("/emprestimo")}
              className="h-11 px-5 inline-flex items-center justify-center gap-2 bg-[#2e8b45] text-white rounded-xl text-[15px] font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer shrink-0 active:scale-95"
            >
              <MdArrowBack size={19} />
              Voltar
            </button>
          </div>

          <FormRealizarEmprestimo />
        </div>
      </main>
    </div>
  );
}
