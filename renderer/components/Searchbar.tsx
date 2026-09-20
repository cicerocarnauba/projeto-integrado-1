import { MdSearch, MdFilterList } from "react-icons/md";

export default function SearchBar() {
  return (
    <div className="flex items-center gap-4 flex-1">

      <div className="flex-1 h-10.5 bg-gray-50 border border-[#2e8b45] rounded-full px-5 py-2.5 flex items-center justify-between shadow-sm">

        <input
          type="text"
          placeholder="Barra de busca"
          className="bg-transparent placeholder-gray-400 text-gray-800 outline-none w-full text-sm"
        />

        <MdSearch
          size={20}
          className="text-[#2e8b45]"
        />

      </div>

      <button
        className="w-10 h-10 flex items-center justify-center bg-[#2e8b45] rounded-full text-white hover:bg-[#236c35] transition-colors shrink-0"
      >
        <MdFilterList size={20} />
      </button>

    </div>
  );
}
