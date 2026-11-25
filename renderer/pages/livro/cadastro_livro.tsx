import Link from "next/link";
import PageShell from "../../components/PageShell";
import FormCadastroLivro from "../../components/livro/formCadastroLivro";
import { MdArrowBack } from "react-icons/md";

export default function CadastrarLivroPage() {
  return (
    <PageShell
      titulo="Adicionar livro"
      maxWidthClass="w-full max-w-5xl"
      acaoTopo={
        <Link
          href="/livro"
          className="h-10 xl:h-11 px-4 xl:px-5 inline-flex items-center justify-center gap-2 bg-[#2e8b45] text-white rounded-xl text-sm xl:text-base font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <MdArrowBack size={19} />
          Voltar
        </Link>
      }
    >
      <FormCadastroLivro />
    </PageShell>
  );
}
