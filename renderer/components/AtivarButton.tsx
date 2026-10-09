import { MdCheckCircleOutline } from "react-icons/md";

interface AtivarButtonProps {
  onClick: () => void;
}

export default function AtivarButton({
  onClick,
}: AtivarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 w-[96px] bg-[#2e8b45] text-white py-1.5 text-xs rounded-lg font-medium hover:bg-[#236c35] transition-colors cursor-pointer shrink-0"
    > 
      <MdCheckCircleOutline size={14}/>
      Ativar
    </button>
  );
}