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
    <div className="flex h-screen overflow-hidden bg-[#f8fbf9]">
      <Sidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden px-4 sm:px-5 lg:px-6 xl:px-7 2xl:px-8 py-3 sm:py-3.5 xl:py-5 flex flex-col animate-fade-in">
        <div className={`${maxWidthClass} flex-1 min-h-0 flex flex-col`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5 xl:mb-3.5 shrink-0">
            <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold tracking-tight text-gray-900">
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
