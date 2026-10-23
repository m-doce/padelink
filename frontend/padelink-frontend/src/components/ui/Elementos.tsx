// Piezas visuales pequeñas que se repiten en tarjetas y perfiles.
import type { ReactNode } from "react";
import { formatCalificacion, formatPrecio, iniciales } from "@/lib/format";
import type { LineaPrecio } from "@/lib/clases";
import type { Monto } from "@/types";

export function Avatar({ usuario, tamano = "md" }: { usuario?: { nombre: string; apellido: string }; tamano?: "sm" | "md" | "lg" }) {
  const medidas = { sm: "h-8 w-8 text-xs", md: "h-12 w-12 text-base", lg: "h-16 w-16 text-xl" }[tamano];
  return (
    <div className={`${medidas} flex shrink-0 items-center justify-center rounded-full bg-lime-100 font-bold text-lime-700 dark:bg-lime-900/50 dark:text-lime-400`}>
      {iniciales(usuario)}
    </div>
  );
}

export function Calificacion({ valor }: { valor: Monto }) {
  const texto = formatCalificacion(valor);
  return texto ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
      <span aria-hidden>★</span> {texto}
    </span>
  ) : (
    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Nuevo</span>
  );
}

const ESTILOS_ETIQUETA = {
  neutro: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  lima: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
  azul: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  rojo: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
} as const;

export function Etiqueta({ children, tono = "neutro" }: { children: ReactNode; tono?: keyof typeof ESTILOS_ETIQUETA }) {
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${ESTILOS_ETIQUETA[tono]}`}>{children}</span>;
}

/** Lista de precios con etiqueta a la izquierda y monto a la derecha, para que no se mezclen. */
export function ListaPrecios({ lineas }: { lineas: LineaPrecio[] }) {
  if (lineas.length === 0) return null;
  return (
    <dl className="space-y-1.5">
      {lineas.map((l) => (
        <div key={l.etiqueta} className="flex items-baseline justify-between gap-3">
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">
            {l.etiqueta}
            {l.detalle && <span className="ml-1 text-xs text-zinc-400 dark:text-zinc-500">({l.detalle})</span>}
          </dt>
          <dd className="font-semibold tabular-nums text-zinc-900 dark:text-white">{formatPrecio(l.monto)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function IconoUbicacion({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
