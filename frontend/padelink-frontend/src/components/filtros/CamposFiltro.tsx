"use client";

// Controles de filtro reutilizables. Solo muestran y avisan cambios:
// no saben qué se está filtrando (eso lo deciden lib/clases.ts y lib/profesores.ts).

import type { ReactNode } from "react";

export function CampoFiltro({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{titulo}</p>
      {children}
    </div>
  );
}

export function Buscador({ valor, onCambiar, placeholder }: { valor: string; onCambiar: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-zinc-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-zinc-700 dark:bg-zinc-950"
      />
    </div>
  );
}

interface OpcionSelect<V extends string | number> {
  valor: V;
  etiqueta: string;
}

export function Selector<V extends string | number>({
  valor,
  opciones,
  onCambiar,
  etiqueta,
}: {
  valor: V;
  opciones: readonly OpcionSelect<V>[];
  onCambiar: (v: V) => void;
  etiqueta: string;
}) {
  return (
    <select
      value={String(valor)}
      aria-label={etiqueta}
      onChange={(e) => {
        const elegida = opciones.find((o) => String(o.valor) === e.target.value);
        if (elegida) onCambiar(elegida.valor);
      }}
      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-zinc-700 dark:bg-zinc-950"
    >
      {opciones.map((o) => (
        <option key={String(o.valor)} value={String(o.valor)}>
          {o.etiqueta}
        </option>
      ))}
    </select>
  );
}

interface OpcionChip<V> {
  valor: V;
  etiqueta: string;
  detalle?: string;
}

/** Grupo de chips. Sirve tanto para selección múltiple como única (según `activo`). */
export function Chips<V extends string | number>({
  opciones,
  activo,
  onElegir,
}: {
  opciones: readonly OpcionChip<V>[];
  activo: (valor: V) => boolean;
  onElegir: (valor: V) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const marcado = activo(o.valor);
        return (
          <button
            key={String(o.valor)}
            type="button"
            aria-pressed={marcado}
            onClick={() => onElegir(o.valor)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              marcado
                ? "border-lime-500 bg-lime-400 text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-500"
            }`}
          >
            {o.etiqueta}
            {o.detalle && <span className={`ml-1 ${marcado ? "text-zinc-700" : "text-zinc-400"}`}>{o.detalle}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Interruptor({ activo, onCambiar, etiqueta }: { activo: boolean; onCambiar: (v: boolean) => void; etiqueta: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span>{etiqueta}</span>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        onClick={() => onCambiar(!activo)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${activo ? "bg-lime-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${activo ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}
