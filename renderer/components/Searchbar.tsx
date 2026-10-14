import { useState, useRef, useEffect } from "react";
import { MdSearch, MdSort, MdCheck } from "react-icons/md";

export type TipoOrdenacao = "alfabetica" | "recentes";

interface SearchBarProps {
  placeholder?: string;
  valorBusca?: string;
  onChangeBusca?: (value: string) => void;

  // Props opcionais para ordenação
  ordenacao?: TipoOrdenacao;
  onChangeOrdenacao?: (ordem: TipoOrdenacao) => void;
}

export default function SearchBar({
  placeholder = "Pesquisar por título, autor, editora...",
  valorBusca,
  onChangeBusca,
  ordenacao = "alfabetica",
  onChangeOrdenacao,
}: SearchBarProps) {
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown automaticamente ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {/* Linha da barra de busca e botão de ordenar */}
      <div className="flex items-center gap-3 w-full">
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

        {/* Botão de Ordenar */}
        {onChangeOrdenacao && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setDropdownAberto(!dropdownAberto)}
              className="h-11 px-4 flex items-center gap-2 rounded-xl font-medium text-sm transition-all shadow-2xs hover:shadow-sm cursor-pointer shrink-0 border border-[#cde5d4] bg-white hover:bg-[#2e8b45] hover:border-[#2e8b45] text-[#1e582d] hover:text-white group active:scale-95"
            >
              <MdSort
                size={20}
                className="text-[#2e8b45] group-hover:text-white transition-colors"
              />
              <span>Ordenar</span>
            </button>

            {/* Dropdown de Ordenação */}
            {dropdownAberto && (
              <div className="absolute right-0 mt-2.5 w-60 bg-white border border-[#cde5d4] rounded-2xl shadow-xl p-2 z-30 animate-fade-in divide-y divide-gray-100">
                <div className="px-3 py-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Ordenar por
                  </p>
                </div>

                <div className="pt-1.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeOrdenacao("alfabetica");
                      setDropdownAberto(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                      ordenacao === "alfabetica"
                        ? "bg-[#eef7f0] text-[#1e582d]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>Ordem alfabética (A-Z)</span>
                    {ordenacao === "alfabetica" && (
                      <MdCheck size={18} className="text-[#2e8b45]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeOrdenacao("recentes");
                      setDropdownAberto(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                      ordenacao === "recentes"
                        ? "bg-[#eef7f0] text-[#1e582d]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>Adicionados por último</span>
                    {ordenacao === "recentes" && (
                      <MdCheck size={18} className="text-[#2e8b45]" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
