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
  MdMenu,
} from "react-icons/md";

interface SidebarProps {
  activePath?: string;
  className?: string;
}

export default function Sidebar({ activePath, className = "" }: SidebarProps) {
  const router = useRouter();
  const currentPath = activePath ?? router.pathname;

  const [recolhida, setRecolhida] = useState(false);

  useEffect(() => {
    const salva = localStorage.getItem("sidebar_recolhida");
    if (salva !== null) {
      setRecolhida(salva === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setRecolhida((prev) => {
      const novo = !prev;
      localStorage.setItem("sidebar_recolhida", String(novo));
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
      className={`sticky top-0 h-screen bg-[#2e8b45] text-white flex flex-col justify-between select-none shrink-0 transition-all duration-300 ease-in-out z-40 ${
        recolhida ? "w-20 p-4" : "w-64 xl:w-72 p-6"
      } ${className}`}
    >
      <div>
        {/* Cabeçalho da Sidebar com Toggle */}
        <div
          className={`flex items-center mb-6 transition-all ${
            recolhida ? "justify-center" : "justify-between"
          }`}
        >
          {!recolhida && (
            <h2 className="text-xl font-bold text-white tracking-wide">Menu</h2>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-white/90 hover:text-white hover:bg-[#236c35] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
            title={recolhida ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
          >
            {recolhida ? <MdMenu size={22} /> : <MdChevronLeft size={22} />}
          </button>
        </div>

        {/* Links de navegação */}
        <nav className="flex flex-col gap-3 text-sm font-medium">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={recolhida ? item.label : undefined}
                className={`flex items-center rounded-2xl transition-all duration-200 group ${
                  recolhida
                    ? "justify-center p-3"
                    : "justify-between py-3 px-4"
                } ${
                  item.ativo
                    ? "bg-[#216331] font-semibold shadow-sm text-white"
                    : "text-white/90 hover:text-white hover:bg-[#236c35]"
                }`}
              >
                <div
                  className={`flex items-center ${
                    recolhida ? "justify-center" : "gap-3"
                  }`}
                >
                  <Icon
                    size={22}
                    className="shrink-0 transition-transform group-hover:scale-110"
                  />
                  {!recolhida && (
                    <span className="whitespace-nowrap transition-opacity duration-200">
                      {item.label}
                    </span>
                  )}
                </div>

                {!recolhida && (
                  <MdChevronRight
                    size={18}
                    className="shrink-0 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Rodapé / Logotipo */}
      <div className="text-center pt-4 border-t border-white/10">
        <Link
          href="/?anim=expand"
          className={`inline-flex items-center justify-center rounded-2xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group ${
            recolhida ? "p-2 w-full" : "py-2 px-4"
          }`}
          title="Ir para a tela inicial"
        >
          {recolhida ? (
            <span className="text-lg font-bold text-white/90 group-hover:text-white tracking-wider">
              LC
            </span>
          ) : (
            <h1 className="text-2xl font-semibold text-white/90 group-hover:text-white tracking-tight transition-colors">
              LivroCMEI
            </h1>
          )}
        </Link>
      </div>
    </aside>
  );
}