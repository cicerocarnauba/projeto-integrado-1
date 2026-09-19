import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-80 bg-[#2e8b45] text-white p-6 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl h-screen select-none shrink-0">
      <div>
        {/* Título Menu menor e mais discreto */}
        <h2 className="text-lg font-semibold text-white/90 mb-6 tracking-wide">Menu</h2>
        
        {/* Opções de Navegação */}
        <nav className="flex flex-col gap-4 text-sm font-medium">
          <Link 
            href="/emprestimos" 
            className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-[#236c35] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span>📊</span>
              <span>Gerenciar empréstimos</span>
            </div>
            <span className="text-xs">›</span>
          </Link>

          {/* Item Ativo */}
          <Link 
            href="/livro/cadastro_livro" 
            className="flex items-center justify-between py-3 px-4 rounded-2xl bg-[#216331] font-semibold shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span>📖</span>
              <span>Gerenciar livros</span>
            </div>
            <span className="text-xs">›</span>
          </Link>

          <Link 
            href="/professores" 
            className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-[#236c35] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span>👤</span>
              <span>Gerenciar professores</span>
            </div>
            <span className="text-xs">›</span>
          </Link>

          <Link 
            href="/turmas" 
            className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-[#236c35] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span>👥</span>
              <span>Gerenciar turmas</span>
            </div>
            <span className="text-xs">›</span>
          </Link>
        </nav>
      </div>

      {/* Nome do Sistema no rodapé */}
      <div>
        <h1 className="text-lg font-semibold text-white/90 tracking-tight">LivroPiqueT</h1>
      </div>
    </aside>
  );
}