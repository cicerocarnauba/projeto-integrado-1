import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/Searchbar";
import { Livro } from "../../types/livro";
import { useRouter } from "next/router";

import { livros } from "../../mocks/livros-mock";
import { MdAdd } from "react-icons/md";

export default function GerenciarLivros() {
  const router = useRouter();
  const mostrarSucesso = router.query.sucesso === "1";
  const livrosAtivos = livros.filter((livro) => livro.ativo);
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Gerenciar livros
        </h1>

        {mostrarSucesso && (
          <div className="bg-[#d8f3dc] text-[#2e8b45] px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
            ✓ Livro cadastrado com sucesso!
          </div>
        )}

        {/* Barra de busca e botão de adicionar */}
        <div className="flex items-center gap-4 mb-8 w-full">
          <SearchBar placeholder="Pesquisar livro por título ou editora..." />

          <Link
            href="/livro/cadastro_livro"
            className="h-11 px-6 flex items-center justify-center bg-[#2e8b45] text-white rounded-xl font-medium text-sm hover:bg-[#236c35] transition-all whitespace-nowrap gap-2 shadow-sm cursor-pointer shrink-0 active:scale-95"
          >
            <MdAdd size={20} />
            Adicionar Livro
          </Link>
        </div>

        {/* Lista de livros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {livrosAtivos.map((livro) => (
            <div
              key={livro.id}
              className={`rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${
                livro.ativo
                  ? "bg-[#eef7f0] hover:bg-[#e5f3e7]"
                  : "bg-gray-100 opacity-60"
              }`}
            >
              <div>
                <h3
                  className={`font-bold text-lg leading-snug ${
                    livro.ativo ? "text-[#1e582d]" : "text-gray-600"
                  }`}
                >
                  {livro.titulo}
                </h3>

                <p className="text-xs text-[#2e8b45]/80 font-medium mt-1">
                  Editora: {livro.editora}
                </p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#d8ecde]">
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                    livro.ativo
                      ? "bg-white text-[#1e582d] shadow-2xs"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {livro.quantidadeTotal} exemplares
                </span>

                <div className="flex items-center">
                  {livro.ativo === false && (
                    <span className="text-[10px] bg-gray-400 text-white px-2 py-0.5 rounded-full mr-2">
                      Desativado
                    </span>
                  )}

                  <Link
                    href={`/livro/${livro.id}`}
                    className="text-xs font-semibold text-[#2e8b45] hover:text-[#236c35] flex items-center gap-1 transition-colors hover:underline"
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
