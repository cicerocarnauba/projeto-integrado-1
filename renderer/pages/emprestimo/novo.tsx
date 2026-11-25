import { useRouter } from "next/router";
import PageShell from "../../components/PageShell";
import FormRealizarEmprestimo from "../../components/emprestimo/formRealizarEmprestimo";
import { MdArrowBack } from "react-icons/md";

// Rota: /emprestimo/novo
export default function RealizarEmprestimo() {
  const router = useRouter();

  return (
    <PageShell
      titulo="Realizar empréstimo"
      maxWidthClass="w-full max-w-5xl"
      acaoTopo={
        <button
          type="button"
          onClick={() => router.push("/emprestimo")}
          className="h-10 xl:h-11 px-4 xl:px-5 inline-flex items-center justify-center gap-2 bg-[#2e8b45] text-white rounded-xl text-sm xl:text-base font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <MdArrowBack size={19} />
          Voltar
        </button>
      }
    >
      <FormRealizarEmprestimo />
    </PageShell>
  );
}
