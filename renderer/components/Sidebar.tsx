import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  MdSwapHoriz,
  MdMenuBook,
  MdPerson,
  MdGroups,
  MdChevronRight,
  MdChevronLeft,
} from "react-icons/md";

interface SidebarProps {
  activePath?: string;
  className?: string;
}

// O padrão é sempre abrir a barra expandida (recolhida = false)
let sessionRecolhida = false;

export function isSidebarRecolhida(): boolean {
  return sessionRecolhida;
}

export default function Sidebar({ activePath, className = "" }: SidebarProps) {
  const router = useRouter();
  const currentPath = activePath ?? router.pathname;

  const [recolhida, setRecolhida] = useState<boolean>(() => sessionRecolhida);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    try {
      localStorage.removeItem("sidebar_recolhida");
    } catch (_) {}

    function sincronizarResponsivo() {
      if (window.innerWidth < 1024) {
        setRecolhida(true);
      } else {
        setRecolhida(sessionRecolhida);
      }
    }

    sincronizarResponsivo();
    window.addEventListener("resize", sincronizarResponsivo);
    return () => window.removeEventListener("resize", sincronizarResponsivo);
  }, []);

  const toggleSidebar = () => {
    setRecolhida((prev) => {
      const novo = !prev;
      sessionRecolhida = novo;
      return novo;
    });
  };

  const menuItems = [
    {
      label: "Gerenciar empréstimos",
      href: "/emprestimo",
      icon: MdSwapHoriz,
      ativo: currentPath.startsWith("/emprestimo"),
    },
    {
      label: "Gerenciar livros",
      href: "/livro",
      icon: MdMenuBook,
      ativo: currentPath.startsWith("/livro"),
    },
    {
      label: "Gerenciar professores",
      href: "/professor",
      icon: MdPerson,
      ativo: currentPath.startsWith("/professor"),
    },
    {
      label: "Gerenciar turmas",
      href: "/turma",
      icon: MdGroups,
      ativo: currentPath.startsWith("/turma"),
    },
  ];

  return (
    <aside
      suppressHydrationWarning
      className={`sticky top-0 h-screen bg-[#2e8b45] text-white flex flex-col justify-between select-none shrink-0 overflow-hidden shadow-md ${
        montado ? "transition-[width] duration-300 ease-in-out" : "transition-none"
      } z-40 px-3 xl:px-4 py-4 xl:py-6 ${
        recolhida ? "w-[72px] xl:w-20" : "w-[256px] xl:w-[284px] 2xl:w-[304px]"
      } ${className}`}
    >
      <div className="flex flex-col w-full">
        {/* Cabeçalho da Sidebar com Toggle */}
        <div className="flex items-center justify-between h-10 xl:h-12 mb-4 xl:mb-6 w-full">
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${
              recolhida ? "w-0 opacity-0" : "w-auto opacity-100 delay-100"
            }`}
          >
            <h2 className="text-lg xl:text-xl font-bold text-white tracking-tight whitespace-nowrap pl-2.5">
              Menu
            </h2>
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            className={`w-9 h-9 xl:w-10 xl:h-10 shrink-0 flex items-center justify-center rounded-xl border border-white/20 text-white/95 hover:text-white hover:bg-[#236c35] active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 mr-1 ${
              recolhida ? "mx-auto mr-auto" : ""
            }`}
            title={recolhida ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
          >
            <MdChevronLeft
              size={22}
              className={`transition-transform duration-300 ease-in-out shrink-0 ${
                recolhida ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>

        {/* Links de navegação */}
        <nav className="flex flex-col gap-1.5 xl:gap-2 text-sm xl:text-base font-medium w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={recolhida ? item.label : undefined}
                className={`flex items-center h-11 xl:h-[50px] w-full rounded-xl transition-colors duration-200 group relative overflow-hidden ${
                  item.ativo
                    ? "bg-[#1f6130] font-semibold shadow-xs ring-1 ring-white/15 text-white"
                    : "text-white/92 hover:text-white hover:bg-[#247037]"
                }`}
              >
                {/* Ícone fixo em tamanho e centralização */}
                <div className="w-11 xl:w-12 h-11 xl:h-[50px] flex items-center justify-center shrink-0">
                  <Icon
                    size={22}
                    className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />
                </div>

                {/* Conteúdo expansível: Label completo + Seta padronizada */}
                <div
                  className={`flex items-center justify-between flex-1 min-w-0 overflow-hidden transition-opacity ease-in-out ${
                    recolhida
                      ? "opacity-0 pointer-events-none duration-100 delay-0"
                      : "opacity-100 duration-200 delay-100"
                  }`}
                >
                  <span className="whitespace-nowrap text-sm xl:text-base pl-0.5">
                    {item.label}
                  </span>

                  <div className="w-7 xl:w-8 h-11 xl:h-[50px] shrink-0 flex items-center justify-center mr-0.5 xl:mr-1">
                    <MdChevronRight
                      size={18}
                      className="text-white/75 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Rodapé / Logotipo */}
      <div className="text-center pt-3 xl:pt-4 border-t border-white/10 w-full overflow-hidden">
        <Link
          href="/?anim=expand"
          className="w-full flex items-center justify-center h-10 xl:h-12 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group px-2 overflow-hidden"
          title="Ir para a tela inicial"
        >
          <div className="relative w-full h-8 flex items-center justify-center overflow-hidden">
            {/* Modo recolhido: ícone do livro */}
            <div
              className={`absolute flex items-center justify-center transition-opacity duration-200 ${
                recolhida ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <MdMenuBook
                size={24}
                className="text-white/90 group-hover:text-white transition-transform group-hover:scale-110"
              />
            </div>

            {/* Modo expandido: ícone do livro do lado esquerdo de LivroCMEI */}
            <div
              className={`absolute flex items-center justify-center gap-2.5 transition-opacity duration-200 ${
                recolhida ? "opacity-0 pointer-events-none" : "opacity-100 delay-100"
              }`}
            >
              <MdMenuBook
                size={24}
                className="text-white/90 group-hover:text-white shrink-0 transition-transform group-hover:scale-110"
              />
              <h1 className="text-xl xl:text-2xl font-semibold text-white/90 group-hover:text-white tracking-tight whitespace-nowrap">
                LivroCMEI
              </h1>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}