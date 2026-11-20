import Link from "next/link";
import { IconType } from "react-icons";
import { MdGroups, MdMenuBook, MdPerson, MdSwapHoriz } from "react-icons/md";

export interface ModuloItem {
  titulo: string;
  href: string;
  icone: string;
}

interface CardModuloProps {
  modulo: ModuloItem;
  onSelect?: (href: string) => void;
  disabled?: boolean;
}

const ICONES_MODULO: Record<string, IconType> = {
  swap_horiz: MdSwapHoriz,
  menu_book: MdMenuBook,
  person: MdPerson,
  groups: MdGroups,
};

export default function CardModulo({ modulo, onSelect, disabled }: CardModuloProps) {
  const Icone = ICONES_MODULO[modulo.icone] ?? MdMenuBook;

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      if (!disabled) {
        onSelect(modulo.href);
      }
    }
  };

  return (
    <Link
      href={modulo.href}
      onClick={handleClick}
      className={`group bg-white border-2 border-white/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 min-h-[145px] sm:min-h-[195px] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col items-center justify-center text-center cursor-pointer ${
        disabled ? "pointer-events-none opacity-80" : ""
      }`}
    >
      <div className="w-14 h-14 sm:w-[70px] sm:h-[70px] rounded-2xl bg-[#dff2e3] flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#2e8b45] group-hover:scale-105 transition-all duration-300">
        <Icone
          className="text-3xl sm:text-4xl text-[#2e8b45] group-hover:text-white transition-colors duration-300"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-base sm:text-[20px] font-bold text-[#1e582d] group-hover:text-[#174623] transition-colors leading-snug">
        {modulo.titulo}
      </h3>
    </Link>
  );
}
