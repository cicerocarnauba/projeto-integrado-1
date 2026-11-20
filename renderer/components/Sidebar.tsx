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

export default function Sidebar({ activePath, className = "" }: SidebarProps) {
  const router = useRouter();
  const currentPath = activePath ?? router.pathname;

  const [recolhida, setRecolhida] = useState<boolean>(() => sessionRecolhida);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    // Limpa chave antiga do localStorage se existir para não forçar fechamento
    try {
      localStorage.removeItem("sidebar_recolhida");
    } catch (_) {}
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
      className={`sticky top-0 h-screen bg-[#2e8b45] text-white flex flex-col justify-between select-none shrink-0 overflow-hidden ${
        montado ? "transition-[width] duration-300 ease-in-out" : "transition-none"
      } z-40 px-4 py-6 ${recolhida ? "w-20" : "w-72 xl:w-80"} ${className}`}
    >
      <div className="flex flex-col w-full">
        {/* Cabeçalho da Sidebar com Toggle */}
        <div className="flex items-center justify-between h-12 mb-6 w-full">
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${
              recolhida ? "w-0 opacity-0" : "w-auto opacity-100 delay-100"
            }`}
          >
            <h2 className="text-xl font-bold text-white tracking-wide whitespace-nowrap pl-2">
              Menu
            </h2>
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-white/90 hover:text-white hover:bg-[#236c35] active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 mr-1 ${
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
        <nav className="flex flex-col gap-2.5 text-sm font-medium w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={recolhida ? item.label : undefined}
                className={`flex items-center h-12 w-full rounded-xl transition-colors duration-200 group relative overflow-hidden ${
                  item.ativo
                    ? "bg-[#216331] font-semibold shadow-sm text-white"
                    : "text-white/90 hover:text-white hover:bg-[#236c35]"
                }`}
              >
                {/* Ícone fixo em tamanho e centralização: sempre 48px de largura (w-12 h-12) */}
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <Icon
                    size={22}
                    className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />
                </div>

                {/* Conteúdo expansível: Label completo (sem cortar) + Seta Padronizada em linha reta */}
                <div
                  className={`flex items-center justify-between flex-1 min-w-0 overflow-hidden transition-opacity ease-in-out ${
                    recolhida
                      ? "opacity-0 pointer-events-none duration-100 delay-0"
                      : "opacity-100 duration-200 delay-100"
                  }`}
                >
                  <span className="whitespace-nowrap text-sm pl-1 font-medium">
                    {item.label}
                  </span>

                  <div className="w-8 h-12 shrink-0 flex items-center justify-center mr-1">
                    <MdChevronRight
                      size={18}
                      className="text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Rodapé / Logotipo */}
      <div className="text-center pt-4 border-t border-white/10 w-full overflow-hidden">
        <Link
          href="/?anim=expand"
          className="w-full flex items-center justify-center h-12 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group px-2 overflow-hidden"
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
                size={26}
                className="text-white/90 group-hover:text-white shrink-0 transition-transform group-hover:scale-110"
              />
              <h1 className="text-2xl font-semibold text-white/90 group-hover:text-white tracking-tight whitespace-nowrap">
                LivroCMEI
              </h1>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}