import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import FormCadastroLivro from "../../components/livro/formCadastroLivro";


export default function GerenciarLivros() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <p className="text-2xl font-bold text-gray-800 mb-6">
          Gerenciar livros
        </p>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Adicionar livro</h1>

          <Link
            href="/livro"
            className="flex items-center gap-1 bg-[#2e8b45] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#236c35] transition-colors"
          >
            ← Voltar
          </Link>
        </div>

        <FormCadastroLivro />
      </main>
    </div>
  );
}
