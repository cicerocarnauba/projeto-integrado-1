import { MdRemoveCircleOutline } from "react-icons/md";

interface DesativarButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export default function DesativarButton({
  onClick,
  disabled = false,
  title,
}: DesativarButtonProps) {
  const defaultTitle = disabled
    ? "Não é possível desativar: possui empréstimos pendentes"
    : "Desativar";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title || defaultTitle}
      className={`inline-flex items-center justify-center gap-1.5 w-[98px] h-8 text-[13.5px] rounded-lg font-semibold transition-colors shrink-0 ${
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-[#cf4a4a] text-white hover:bg-[#b83a3a] cursor-pointer"
      }`}
    >
      <MdRemoveCircleOutline size={16} />
      Desativar
    </button>
  );
}
