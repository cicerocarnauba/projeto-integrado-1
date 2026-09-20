import { useRouter } from "next/router";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import { livros } from "../../mocks/livros-mock";

export default function DetalhesLivro() {
  const router = useRouter();
  const { id } = router.query;

  const livro = livros.find((l) => l.id === Number(id));

  if (!livro) {
    return <p>Livro não encontrado.</p>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <p className="text-2xl font-bold text-gray-800 mb-6">
          Gerenciar livros
        </p>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Detalhes do livro
          </h1>

          <Link
            href="/livro"
            className="flex items-center gap-1 bg-[#2e8b45] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#236c35] transition-colors"
          >
            ← Voltar
          </Link>
        </div>
        <div className="border-2 border-[#2e8b45] rounded-3xl p-6 max-w-3xl">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">
                Título do Livro
              </label>
              <input
                type="text"
                value={livro.titulo}
                readOnly
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <div
                className={`px-3 py-2 rounded-lg text-sm font-semibold text-center bg-gray-50 border border-gray-200 ${
                  livro.ativo ? "text-[#2e8b45]" : "text-gray-500"
                }`}
              >
                {livro.ativo ? "Ativo" : "Inativo"}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">
                Editora
              </label>
              <input
                type="text"
                value={livro.editora}
                readOnly
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Total de exemplares
              </label>
              <div className="px-3 py-2 rounded-lg text-sm font-semibold text-center bg-gray-50 border border-gray-200 text-[#2e8b45]">
                {livro.quantidadeTotal} exemplares
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              disabled={livro.statusEmprestimo === "emprestado_atualmente"}
              className={`flex items-center gap-1 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                livro.statusEmprestimo === "emprestado_atualmente"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {livro.statusEmprestimo === "nunca_emprestado"
                ? "🗑 Excluir livro"
                : "⊖ Desativar livro"}
            </button>

            <button className="flex items-center gap-1 bg-[#2e8b45] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#236c35] transition-colors">
              ✏ Editar livro
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
