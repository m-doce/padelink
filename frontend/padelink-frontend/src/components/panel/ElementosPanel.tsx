// Piezas de layout compartidas por los paneles de alumno, profesor y admin.
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Elementos";
import { estadoVisible, type EstadoVisible } from "@/lib/clases";
import type { ClaseListado } from "@/types";

export function EncabezadoPanel({
  usuario,
  saludo,
  subtitulo,
  acciones,
}: {
  usuario?: { nombre: string; apellido: string };
  saludo: string;
  subtitulo?: string;
  acciones?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {usuario && <Avatar usuario={usuario} tamano="lg" />}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{saludo}</h1>
          {subtitulo && <p className="mt-1 text-zinc-500 dark:text-zinc-400">{subtitulo}</p>}
        </div>
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </header>
  );
}

const TONOS_DATO = {
  neutro: "text-zinc-900 dark:text-white",
  lima: "text-lime-600 dark:text-lime-400",
  azul: "text-sky-600 dark:text-sky-400",
  ambar: "text-amber-600 dark:text-amber-400",
  rojo: "text-red-600 dark:text-red-400",
} as const;

/** Un número importante con su explicación (ej.: "3 · Próximas clases"). */
export function TarjetaDato({
  etiqueta,
  valor,
  detalle,
  tono = "neutro",
}: {
  etiqueta: string;
  valor: ReactNode;
  detalle?: ReactNode;
  tono?: keyof typeof TONOS_DATO;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{etiqueta}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${TONOS_DATO[tono]}`}>{valor}</p>
      {detalle && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{detalle}</p>}
    </div>
  );
}

export function GrillaDatos({ children }: { children: ReactNode }) {
  return <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{children}</div>;
}

export interface Pestana<T extends string> {
  id: T;
  etiqueta: string;
  cantidad?: number;
}

/** Pestañas accesibles. No sabe qué contenido muestra cada una: solo avisa cuál se eligió. */
export function Pestanas<T extends string>({ pestanas, activa, onCambiar }: { pestanas: Pestana<T>[]; activa: T; onCambiar: (id: T) => void }) {
  return (
    <div role="tablist" className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
      {pestanas.map((p) => {
        const seleccionada = p.id === activa;
        return (
          <button
            key={p.id}
            role="tab"
            type="button"
            aria-selected={seleccionada}
            onClick={() => onCambiar(p.id)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              seleccionada
                ? "border-lime-500 text-zinc-900 dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {p.etiqueta}
            {p.cantidad !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-xs ${seleccionada ? "bg-lime-400 text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800"}`}>{p.cantidad}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Tarjeta({ titulo, descripcion, acciones, children }: { titulo?: string; descripcion?: string; acciones?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      {(titulo || acciones) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="text-lg font-semibold">{titulo}</h2>}
            {descripcion && <p className="text-sm text-zinc-500 dark:text-zinc-400">{descripcion}</p>}
          </div>
          {acciones}
        </div>
      )}
      {children}
    </section>
  );
}

const ESTILOS_ESTADO: Record<EstadoVisible, { texto: string; clase: string }> = {
  disponible: { texto: "Con lugares", clase: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300" },
  completa: { texto: "Completa", clase: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" },
  cancelada: { texto: "Cancelada", clase: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  finalizada: { texto: "Finalizada", clase: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
};

export function EtiquetaEstado({ clase }: { clase: ClaseListado }) {
  const estilo = ESTILOS_ESTADO[estadoVisible(clase)];
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${estilo.clase}`}>{estilo.texto}</span>;
}

/** Estilos de botones reutilizados en los paneles. */
export const BOTON = {
  primario:
    "inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-300",
  secundario:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
  peligro:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30",
} as const;
