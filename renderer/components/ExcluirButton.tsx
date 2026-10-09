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
      className={`flex items-center justify-center gap-1.5 w-[88px] py-1.5 text-xs rounded-lg font-medium transition-colors shrink-0 ${
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
          : "bg-[#cf4a4a] text-white hover:bg-[#b83a3a] cursor-pointer"
      }`}
    >
      <MdDelete size={14} />
      Excluir
    </button>
  );
}