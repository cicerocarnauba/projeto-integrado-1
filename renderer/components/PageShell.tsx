import React from "react";
import Sidebar from "./Sidebar";

interface PageShellProps {
  titulo: string;
  acaoTopo?: React.ReactNode;
  maxWidthClass?: string;
  children: React.ReactNode;
}

/**
 * Estrutura padrão responsiva para todas as páginas internas do sistema.
 * Centraliza Sidebar, espaçamentos responsivos e cabeçalho com título e ação opcional.
 */
export default function PageShell({
  titulo,
  acaoTopo,
  maxWidthClass = "w-full",
  children,
}: PageShellProps) {
  return (
    <div className="flex min-h-screen bg-[#f8fbf9]">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 animate-fade-in">
        <div className={maxWidthClass}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
            <h1 className="text-2xl sm:text-[26px] lg:text-[28px] font-bold tracking-tight text-gray-900">
              {titulo}
            </h1>
            {acaoTopo}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
