import Link from "next/link";
import { useRouter } from "next/router";
import { MdBarChart, MdMenuBook, MdPerson, MdGroups } from "react-icons/md";

export default function Sidebar() {
  const router = useRouter();

  const professoresAtivo =
    router.pathname.startsWith('/professor');

  const livroAtivo =
    router.pathname.startsWith('/livro');

  const turmaAtiva =
    router.pathname.startsWith('/turma');

  const emprestimoAtivo =
    router.pathname.startsWith('/emprestimo');
  
    
  return (
    <aside className="w-80 bg-[#2e8b45] text-white p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl h-screen select-none shrink-0">
      <div>
        <h2 className="text-2xl font-semibold text-white/90 mb-6 tracking-wide">
          Menu
        </h2>

        <nav className="flex flex-col gap-4 text-sm font-medium">
          <Link 
            href="/esmprestimo"
            className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
              emprestimoAtivo
                ? 'bg-[#216331] font-semibold shadow-sm'
                : 'hover:bg-[#236c35]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MdBarChart size={20} />
              <span>Gerenciar empréstimos</span>
            </div>
            <span className="text-xs">›</span>
          </Link>
          {/* Item Ativo */}
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
        <h1 className="text-2xl font-semibold text-white/90 tracking-tight">
          LivroPiqueT
        </h1>
      </div>
    </aside>
  );
}