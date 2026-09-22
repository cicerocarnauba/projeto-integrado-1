import { useState, useRef, useEffect } from "react";
import { MdSearch, MdFilterList } from "react-icons/md";

interface SearchBarProps {
  placeholder?: string;
  valorBusca?: string;
  onChangeBusca?: (value: string) => void;

  // Props opcionais para o filtro
  incluirInativos?: boolean;
  onToggleInativos?: (checked: boolean) => void;
  labelCheckbox?: string;
}

export default function SearchBar({
  placeholder = "Pesquisar por título, autor, editora...",
  valorBusca,
  onChangeBusca,
  incluirInativos = false,
  onToggleInativos,
  labelCheckbox = "Exibir registros inativos",
}: SearchBarProps) {
  const [filtroAberto, setFiltroAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown automaticamente ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setFiltroAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3 flex-1">
      {/* Campo de Busca */}
      <div className="flex-1 h-11 bg-white border border-[#cde5d4] rounded-xl px-4 flex items-center gap-3 shadow-2xs transition-all focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/15">
        <MdSearch size={22} className="text-[#2e8b45] shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={valorBusca}
          onChange={(e) => onChangeBusca?.(e.target.value)}
          className="bg-transparent placeholder-gray-400 text-gray-800 outline-none w-full text-sm"
        />
      </div>

      {/* Botão de Filtro */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => {
            if (onToggleInativos) {
              setFiltroAberto(!filtroAberto);
            }
          }}
          className={`h-11 px-4 flex items-center gap-2 rounded-xl font-medium text-sm transition-all shadow-2xs hover:shadow-sm cursor-pointer shrink-0 border active:scale-95 ${
            incluirInativos
              ? "bg-[#eef7f0] text-[#1e582d] border-[#2e8b45]"
              : "bg-white hover:bg-[#2e8b45] border-[#cde5d4] hover:border-[#2e8b45] text-[#1e582d] hover:text-white group"
          }`}
        >
          <MdFilterList
            size={20}
            className={
              incluirInativos
                ? "text-[#1e582d]"
                : "text-[#2e8b45] group-hover:text-white transition-colors"
            }
          />
          <span>Filtrar</span>
        </button>

        
        {/* Dropdown do filtro */}
        {filtroAberto && onToggleInativos && (
          <div className="absolute right-0 mt-2.5 w-64 bg-white border border-[#cde5d4] rounded-2xl shadow-xl p-3 z-30 animate-fade-in divide-y divide-gray-100">
            {/* Cabeçalho do Dropdown */}
            <div className="px-2 pb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Opções de visualização
              </p>
            </div>

            {/* Opção / Checkbox */}
            <div className="pt-2">
              <label
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all select-none ${
                  incluirInativos
                    ? "bg-[#eef7f0] text-[#1e582d]"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <input
                  type="checkbox"
                  checked={incluirInativos}
                  onChange={(e) => onToggleInativos(e.target.checked)}
                  className="w-4 h-4 text-[#2e8b45] rounded-md border-gray-300 focus:ring-[#2e8b45] focus:ring-offset-0 cursor-pointer accent-[#2e8b45]"
                />
                <span className="flex-1">{labelCheckbox}</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
