import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import FormCadastroLivro from "../../components/livro/formCadastroLivro";
import { MdArrowBack } from "react-icons/md";

export default function GerenciarLivros() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8 animate-fade-in">
        {/* Cabeçalho e botão voltar */}
        <div className="flex items-center justify-between mb-8 w-full">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Adicionar livro</h1>
          </div>

          <Link
            href="/livro"
            className="flex items-center gap-1.5 bg-[#2e8b45] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#236c35] transition-all shadow-sm cursor-pointer"
          >
            <MdArrowBack size={18} />
            Voltar
          </Link>
        </div>

        {/* Formulário de cadastro */}
        <FormCadastroLivro />
      </main>
    </div>
  );
}
