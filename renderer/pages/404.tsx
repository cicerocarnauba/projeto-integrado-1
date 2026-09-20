import Head from "next/head";
import Link from "next/link";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Página não encontrada - LivroPiqueT</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </Head>

      <div className="h-screen min-h-[600px] bg-[#2e8b45] text-white flex flex-col justify-between items-center select-none p-8">
        <div className="flex-1" />

        {/* Card de Erro 404 */}
        <div className="bg-white border-2 border-[#2e8b45] rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl text-center text-gray-800">
          {/* Ícone de aviso de perigo*/}
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-600">
            <span className="material-symbols-outlined text-4xl">
              warning
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Erro 404
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">
            Página não encontrada
          </h1>

          {/* Botão para voltar à Home*/}
          <Link
            href="/"
            className="w-full bg-[#2e8b45] hover:bg-[#236c35] text-white py-3 px-6 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base">
              arrow_back
            </span>
            <span>Voltar para o Início</span>
          </Link>
        </div>

        <div className="flex-1 flex items-end justify-center pb-2">
          <footer className="text-center text-white/75 text-xs">
            <p>CEMEI Professora Maria de Lourdes Demasceno Marques • Piquet Carneiro</p>
          </footer>
        </div>
      </div>
    </>
  );
}
