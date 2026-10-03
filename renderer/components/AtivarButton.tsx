import { MdCheckCircleOutline } from "react-icons/md"

interface DesativarButtonProps {
  onClick: () => void;
}

export default function DesativarButton({
  onClick,
}: DesativarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 bg-[#2e8b45] text-white px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-[#236c35] transition-colors cursor-pointer shrink-0"
    > 
      <MdCheckCircleOutline size={14}/>
      Ativar
    </button>
  );
}