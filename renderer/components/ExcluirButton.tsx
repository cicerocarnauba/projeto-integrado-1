import { MdDelete } from "react-icons/md"

interface ExcluirButtonProps {
  onClick: () => void;
}

export default function DesativarButton({
  onClick,
}: ExcluirButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 bg-[#cf4a4a] text-white px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-[#b83a3a] transition-colors cursor-pointer shrink-0"
    > 
      <MdDelete size={14}/>
      Excluir
    </button>
  );
}