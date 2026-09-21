import { MdSearch, MdFilterList } from "react-icons/md";

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({ placeholder = "Pesquisar por título, autor, editora..." }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 flex-1">
      {/* Barra de busca */}
      <div className="flex-1 h-11 bg-white border border-[#cde5d4] rounded-xl px-4 flex items-center gap-3 shadow-2xs transition-all focus-within:border-[#2e8b45] focus-within:ring-2 focus-within:ring-[#2e8b45]/15">
        <MdSearch size={22} className="text-[#2e8b45] shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          className="bg-transparent placeholder-gray-400 text-gray-800 outline-none w-full text-sm"
        />
      </div>

      {/* Botão de filtro */}
      <button
        type="button"
        className="h-11 px-4 flex items-center gap-2 bg-white hover:bg-[#2e8b45] border border-[#cde5d4] hover:border-[#2e8b45] rounded-xl text-[#1e582d] hover:text-white font-medium text-sm transition-all shadow-2xs hover:shadow-sm cursor-pointer shrink-0 group active:scale-95"
      >
        <MdFilterList size={20} className="text-[#2e8b45] group-hover:text-white transition-colors" />
        <span>Filtrar</span>
      </button>
    </div>
  );
}
