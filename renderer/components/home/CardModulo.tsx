import Link from "next/link";

export interface ModuloItem {
  titulo: string;
  href: string;
  icone: string;
}

interface CardModuloProps {
  modulo: ModuloItem;
}

export default function CardModulo({ modulo }: CardModuloProps) {
  return (
    <Link
      href={modulo.href}
      className="group bg-white border-2 border-[#2e8b45] rounded-3xl p-8 min-h-[190px] shadow-md hover:shadow-xl hover:border-[#236c35] transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center text-center cursor-pointer"
    >
      {/* Ícone do módulo */}
      <div className="w-16 h-16 rounded-2xl bg-[#d8f3dc] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <span className="material-symbols-outlined text-4xl text-[#2e8b45]">
          {modulo.icone}
        </span>
      </div>

      {/* Título do módulo */}
      <h3 className="text-xl font-bold text-[#2e8b45] group-hover:text-[#236c35] transition-colors leading-snug">
        {modulo.titulo}
      </h3>
    </Link>
  );
}
