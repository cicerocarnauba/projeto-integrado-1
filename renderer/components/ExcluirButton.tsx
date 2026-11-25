import { MdDelete } from "react-icons/md";

interface ExcluirButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export default function ExcluirButton({
  onClick,
  disabled = false,
  title,
}: ExcluirButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title || "Excluir"}
      className={`inline-flex items-center justify-center gap-1 xl:gap-1.5 w-[88px] xl:w-[96px] 2xl:w-[98px] h-8 text-xs xl:text-sm rounded-lg font-semibold transition-colors shrink-0 ${
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-[#cf4a4a] text-white hover:bg-[#b83a3a] cursor-pointer"
      }`}
    >
      <MdDelete size={15} />
      Excluir
    </button>
  );
}
