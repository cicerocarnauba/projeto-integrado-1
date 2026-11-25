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
      className="inline-flex items-center justify-center gap-1 xl:gap-1.5 w-[88px] xl:w-[96px] 2xl:w-[98px] h-8 bg-[#2e8b45] text-white text-xs xl:text-sm rounded-lg font-semibold hover:bg-[#236c35] transition-colors cursor-pointer shrink-0"
    >
      <MdCheckCircleOutline size={15} />
      Ativar
    </button>
  );
}
