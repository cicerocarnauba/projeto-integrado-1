import Link from "next/link";
import { useRouter } from "next/router";
import { MdBarChart, MdMenuBook, MdPerson, MdGroups } from "react-icons/md";

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-80 bg-[#2e8b45] text-white p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl h-screen select-none shrink-0">
      <div>
        <h2 className="text-2xl font-semibold text-white/90 mb-6 tracking-wide">
          Menu
        </h2>

        <nav className="flex flex-col gap-4 text-sm font-medium">
          <Link
            href="/emprestimos"
            className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
              router.pathname.startsWith("/emprestimos")
                ? "bg-[#216331] font-semibold shadow-sm"
                : "hover:bg-[#236c35]"
            }`}
          >
            <div className="flex items-center gap-3">
              <MdBarChart size={20} />
              <span>Gerenciar empréstimos</span>
            </div>
            <span className="text-xs">›</span>
          </Link>

          <Link
            href="/livro/cadastro_livro"
            className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
              router.pathname.startsWith("/livro")
                ? "bg-[#216331] font-semibold shadow-sm"
                : "hover:bg-[#236c35]"
            }`}
          >
            <div className="flex items-center gap-3">
              <MdMenuBook size={20} />
              <span>Gerenciar livros</span>
            </div>
            <span className="text-xs">›</span>
          </Link>

          <Link
            href="/professores"
            className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
              router.pathname.startsWith("/professores")
                ? "bg-[#216331] font-semibold shadow-sm"
                : "hover:bg-[#236c35]"
            }`}
          >
            <div className="flex items-center gap-3">
              <MdPerson size={20} />
              <span>Gerenciar professores</span>
            </div>
            <span className="text-xs">›</span>
          </Link>

          <Link
            href="/turmas"
            className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
              router.pathname.startsWith("/turmas")
                ? "bg-[#216331] font-semibold shadow-sm"
                : "hover:bg-[#236c35]"
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