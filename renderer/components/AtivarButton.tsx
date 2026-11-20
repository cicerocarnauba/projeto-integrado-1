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
      className="inline-flex items-center justify-center gap-1.5 w-[98px] h-8 bg-[#2e8b45] text-white text-[13.5px] rounded-lg font-semibold hover:bg-[#236c35] transition-colors cursor-pointer shrink-0"
    >
      <MdCheckCircleOutline size={16} />
      Ativar
    </button>
  );
}
