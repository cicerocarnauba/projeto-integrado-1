import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import { Livro } from "../../types/livro";
import { useRouter } from "next/router";

import { livros } from "../../mocks/livros-mock";
import { MdSearch, MdFilterList } from "react-icons/md";

export default function GerenciarLivros() {
  const router = useRouter();
  const mostrarSucesso = router.query.sucesso === "1";
  const livrosAtivos = livros.filter((livro) => livro.ativo);
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Gerenciar livros
        </h1>

        {mostrarSucesso && (
          <div className="bg-[#d8f3dc] text-[#2e8b45] px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            ✓ Livro cadastrado com sucesso!
          </div>
        )}

        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 bg-gray-50 border border-[#2e8b45] rounded-full px-5 py-2.5 flex items-center justify-between text-gray-700 shadow-sm">
            <input
              type="text"
              placeholder="Barra de busca"
              className="bg-transparent placeholder-gray-400 text-gray-800 outline-none w-full text-sm"
            />
            <MdSearch size={20} className="text-[#2e8b45]" />
          </div>

          <button className="bg-[#2e8b45] p-2.5 rounded-full text-white hover:bg-[#236c35] transition-colors">
            <MdFilterList size={20} />
          </button>
          <Link
            href="/livro/cadastro_livro"
            className="bg-[#2e8b45] px-5 py-2.5 rounded-full text-white font-medium text-sm flex items-center gap-1 hover:bg-[#236c35] transition-colors"
          >
            + Adicionar Livro
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {livrosAtivos.map((livro) => (
            <div
              className={`border-2 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all ${
                livro.ativo
                  ? "border-[#2e8b45] bg-white hover:border-[#236c35]"
                  : "border-gray-300 bg-gray-50 opacity-60"
              }`}
              key={livro.id}
            >
              <h3
                className={`font-bold text-base ${
                  livro.ativo ? "text-[#2e8b45]" : "text-gray-600"
                }`}
              >
                {livro.titulo}
              </h3>

              <p
                className={`text-xs mt-0.5 ${
                  livro.ativo ? "text-[#2e8b45]" : "text-gray-400"
                }`}
              >
                {livro.editora}
              </p>

              <div className="flex items-center justify-between mt-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    livro.ativo
                      ? "bg-[#d8f3dc] text-[#2e8b45]"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {livro.quantidadeTotal} exemplares
                </span>

                <div className="text-right">
                  {livro.ativo === false && (
                    <span className="block text-[10px] bg-gray-400 text-white px-2 py-0.5 rounded-full mb-1">
                      Desativado
                    </span>
                  )}

                  <Link
                    href={`/livro/${livro.id}`}
                    className={`text-xs font-semibold hover:underline ${
                      livro.ativo ? "text-[#2e8b45]" : "text-gray-500"
                    }`}
                  >
                    Ver detalhes &gt;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
