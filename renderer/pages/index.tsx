import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import HeaderHome from "../components/home/HeaderHome";
import CardModulo, { ModuloItem } from "../components/home/CardModulo";
import Sidebar from "../components/Sidebar";

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
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.search.includes("anim=expand");
    }
    return false;
  });
  const [targetHref, setTargetHref] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("anim=expand")) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectModulo = (href: string) => {
    if (isTransitioning) return;
    setTargetHref(href);
    setIsTransitioning(true);

    setTimeout(() => {
      router.push(href);
    }, 480);
  };

  return (
    <>
      <Head>
        <title>LivroCMEI - Início</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </Head>

      <div className="h-screen w-screen bg-white flex overflow-hidden select-none relative">
        <div
          className={`h-screen bg-[#2e8b45] text-white flex flex-col relative shrink-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isTransitioning
              ? "w-80 shadow-2xl"
              : "w-full rounded-none"
          }`}
        >
          <div
            className={`absolute inset-0 w-screen min-w-[1024px] h-full flex flex-col px-8 transition-all duration-200 ease-out ${
              isTransitioning
                ? "opacity-0 scale-95 pointer-events-none"
                : "opacity-100"
            }`}
          >
            {/* Título */}
            <div className="flex-1 flex items-center justify-center">
              <HeaderHome />
            </div>

            {/* Módulos de gerenciamento */}
            <div className="w-full max-w-6xl mx-auto">
              <main className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {modulos.map((modulo) => (
                    <CardModulo
                      key={modulo.titulo}
                      modulo={modulo}
                      onSelect={handleSelectModulo}
                      disabled={isTransitioning}
                    />
                  ))}
                </div>
              </main>
            </div>

            {/* Rodapé */}
            <div className="flex-1 flex items-end justify-center pb-4">
              <footer className="text-center text-white/75 text-xs">
                <p>CEMEI Professora Maria de Lourdes Demasceno Marques • Piquet Carneiro</p>
              </footer>
            </div>
          </div>

          {/* Sidebar */}
          <div
            className={`absolute top-0 left-0 w-80 h-full transition-opacity duration-300 delay-150 ${
              isTransitioning
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <Sidebar activePath={targetHref ?? undefined} />
          </div>
        </div>

        <div className="flex-1 h-screen bg-white" />
      </div>
    </>
  );
}