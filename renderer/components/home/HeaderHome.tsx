import React from "react";
import { MdMenuBook } from "react-icons/md";

export function IconeLivroCMEI({ className = "w-14 h-14 sm:w-16 sm:h-16" }: { className?: string }) {
  return <MdMenuBook className={`${className} text-white`} aria-hidden="true" />;
}

export default function HeaderHome() {
  return (
    <header className="flex flex-col items-center justify-center text-center">
      <div className="mb-2.5 sm:mb-3.5 text-white transition-transform duration-300 hover:scale-105 cursor-default select-none">
        <MdMenuBook className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-md" aria-hidden="true" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-xs">
        LivroCMEI
      </h1>
      <p className="text-white/95 text-base sm:text-xl font-medium mt-1.5 sm:mt-2">
        Biblioteca Maria de Lourdes
      </p>
    </header>
  );
}