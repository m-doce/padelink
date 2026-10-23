"use client";

import { useState, type ReactNode } from "react";

interface PanelFiltrosProps {
  activos: number;
  onLimpiar: () => void;
  children: ReactNode;
}

/**
 * Contenedor de filtros: barra lateral en pantallas grandes y panel desplegable en celulares.
 * No conoce los filtros que contiene; los recibe como children.
 */
export default function PanelFiltros({ activos, onLimpiar, children }: PanelFiltrosProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <aside className="lg:sticky lg:top-24 lg:w-72 lg:shrink-0 lg:self-start">
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            className="flex items-center gap-2 font-semibold lg:pointer-events-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
            </svg>
            Filtros
            {activos > 0 && (
              <span className="rounded-full bg-lime-400 px-2 py-0.5 text-xs font-bold text-zinc-900">{activos}</span>
            )}
            <svg className={`h-4 w-4 transition lg:hidden ${abierto ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {activos > 0 && (
            <button type="button" onClick={onLimpiar} className="text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:underline dark:hover:text-white">
              Limpiar
            </button>
          )}
        </div>
        <div className={`${abierto ? "block" : "hidden"} space-y-6 border-t border-zinc-100 px-5 py-5 dark:border-zinc-800 lg:block`}>
          {children}
        </div>
      </div>
    </aside>
  );
}
