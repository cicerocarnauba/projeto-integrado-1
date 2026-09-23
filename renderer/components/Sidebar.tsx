import Link from "next/link";
import { useRouter } from "next/router";
import { MdSwapHoriz, MdMenuBook, MdPerson, MdGroups } from "react-icons/md";

interface SidebarProps {
  activePath?: string;
  className?: string;
}

export default function Sidebar({ activePath, className = "" }: SidebarProps) {
  const router = useRouter();
  const currentPath = activePath ?? router.pathname;

  const professoresAtivo =
    currentPath.startsWith('/professor');

  const livroAtivo =
    currentPath.startsWith('/livro');

  const turmaAtiva =
    currentPath.startsWith('/turma');

  const emprestimoAtivo =
    currentPath.startsWith('/emprestimo');
  
    
  return (
    <aside className={`w-80 bg-[#2e8b45] text-white p-6 flex flex-col justify-between h-screen select-none shrink-0 ${className}`}>
      <div>
        <h2 className="text-2xl font-semibold text-white/90 mb-6 tracking-wide">
          Menu
        </h2>

        <nav className="flex flex-col gap-4 text-sm font-medium">
          <Link 
            href="/emprestimo"
            className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
              emprestimoAtivo
                ? 'bg-[#216331] font-semibold shadow-sm'
                : 'hover:bg-[#236c35]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MdSwapHoriz size={20} />
              <span>Gerenciar empréstimos</span>
            </div>
            <span className="text-xs">›</span>
          </Link>
          <Link 
            href="/livro"
            className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
              livroAtivo
                ? 'bg-[#216331] font-semibold shadow-sm'
                : 'hover:bg-[#236c35]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MdMenuBook size={20} />
              <span>Gerenciar livros</span>
            </div>
            <span className="text-xs">›</span>
          </Link>

          <Link 
            href="/professor"
            className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
              professoresAtivo
                ? 'bg-[#216331] font-semibold shadow-sm'
                : 'hover:bg-[#236c35]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MdPerson size={20} />
              <span>Gerenciar professores</span>
            </div>
            <span className="text-xs">›</span>
          </Link>

          <Link 
            href="/turma"
            className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
              turmaAtiva
                ? 'bg-[#216331] font-semibold shadow-sm'
                : 'hover:bg-[#236c35]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MdGroups size={20} />
              <span>Gerenciar turmas</span>
            </div>
            <span className="text-xs">›</span>
          </Link>
        </nav>
      </div>

      <div className="text-center">
        <Link
          href="/?anim=expand"
          className="inline-flex items-center justify-center py-2 px-4 rounded-2xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
          title="Ir para a tela inicial"
        >
          <h1 className="text-2xl font-semibold text-white/90 group-hover:text-white tracking-tight transition-colors">
            LivroPiqueT
          </h1>
        </Link>
      </div>
    </aside>
  );
}