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

  // Props opcionais para inativos (exibido abaixo da barra de busca)
  incluirInativos?: boolean;
  onToggleInativos?: (checked: boolean) => void;
  labelCheckbox?: string;
}

export default function SearchBar({
  placeholder = "Pesquisar por título, autor, editora...",
  valorBusca,
  onChangeBusca,
  ordenacao = "alfabetica",
  onChangeOrdenacao,
  incluirInativos = false,
  onToggleInativos,
  labelCheckbox = "Incluir inativos",
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

      {/* Opção Incluir Inativos abaixo da barra de busca com toggle harmonioso */}
      {onToggleInativos && (
        <div className="mt-2.5 flex items-center">
          <button
            type="button"
            onClick={() => onToggleInativos(!incluirInativos)}
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer select-none transition-all hover:bg-[#eef7f0]/60 active:scale-95 group"
          >
            {/* Switch visual compatível com o design system dos cards */}
            <div
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${
                incluirInativos ? "bg-[#389348]" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-xs ${
                  incluirInativos ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </div>
            <span
              className={`text-xs font-semibold transition-colors ${
                incluirInativos
                  ? "text-[#1e582d]"
                  : "text-gray-500 group-hover:text-gray-700"
              }`}
            >
              {labelCheckbox}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
