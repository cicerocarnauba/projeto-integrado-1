import Head from "next/head";
import HeaderHome from "../components/home/HeaderHome";
import CardModulo, { ModuloItem } from "../components/home/CardModulo";

const modulos: ModuloItem[] = [
  {
    titulo: "Gerenciar Empréstimos",
    href: "/emprestimo",
    icone: "swap_horiz",
  },
  {
    titulo: "Gerenciar Livros",
    href: "/livro",
    icone: "menu_book",
  },
  {
    titulo: "Gerenciar Professores",
    href: "/professor",
    icone: "person",
  },
  {
    titulo: "Gerenciar Turmas",
    href: "/turma",
    icone: "groups",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>LivroPiqueT - Início</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </Head>

      <div className="h-screen min-h-[600px] bg-[#2e8b45] text-white flex flex-col select-none px-8">
        {/*Título*/}
        <div className="flex-1 flex items-center justify-center">
          <HeaderHome />
        </div>

        {/* Modulos de gerenciamento */}
        <div className="w-full max-w-6xl mx-auto">
          <main className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {modulos.map((modulo) => (
                <CardModulo key={modulo.titulo} modulo={modulo} />
              ))}
            </div>
          </main>
        </div>

        {/*rodapé*/}
        <div className="flex-1 flex items-end justify-center pb-4">
          <footer className="text-center text-white/75 text-xs">
            <p>CEMEI Professora Maria de Lourdes Demasceno Marques • Piquet Carneiro</p>
          </footer>
        </div>
      </div>
    </>
  );
}