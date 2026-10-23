import Link from "next/link";
import type { ProfesorConDatos } from "@/lib/profesores";
import { formatNivel, formatPrecio, nombreCompleto } from "@/lib/format";
import { Avatar, Calificacion, Etiqueta, IconoUbicacion } from "@/components/ui/Elementos";

function Precio({ etiqueta, detalle, monto }: { etiqueta: string; detalle: string; monto: ProfesorConDatos["precioClaseGrupal"] }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/60">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{etiqueta}</p>
      <p className="text-base font-bold tabular-nums">{formatPrecio(monto)}</p>
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{detalle}</p>
    </div>
  );
}

export default function ProfesorCard({ profesor }: { profesor: ProfesorConDatos }) {
  const perfil = `/professors/${profesor.usuario_id}`;
  const mano = profesor.manoDominante?.toLowerCase();

  return (
    <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-start gap-3">
        <Avatar usuario={profesor.usuario} tamano="lg" />
        <div className="min-w-0 flex-1">
          <Link href={perfil} className="block truncate text-lg font-bold hover:text-lime-600 dark:hover:text-lime-400">
            {nombreCompleto(profesor.usuario)}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Calificacion valor={profesor.promedioCalificacion} />
            {mano && <Etiqueta>{mano === "zurdo" ? "Zurdo" : "Diestro"}</Etiqueta>}
          </div>
        </div>
      </header>

      <p className="mt-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{profesor.bio || "Sin descripción disponible."}</p>

      {(profesor.ciudades.length > 0 || profesor.niveles.length > 0) && (
        <div className="mt-4 space-y-2 text-xs">
          {profesor.ciudades.length > 0 && (
            <p className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <IconoUbicacion className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{profesor.ciudades.join(" · ")}</span>
            </p>
          )}
          {profesor.niveles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profesor.niveles.map((n) => (
                <Etiqueta key={n}>{formatNivel(n)}</Etiqueta>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Precio etiqueta="Grupal" detalle="por persona" monto={profesor.precioClaseGrupal} />
        <Precio etiqueta="Individual" detalle="por clase" monto={profesor.precioClaseIndividual} />
      </div>

      <footer className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {profesor.clasesDisponibles === 0
            ? "Sin clases disponibles"
            : `${profesor.clasesDisponibles} ${profesor.clasesDisponibles === 1 ? "clase disponible" : "clases disponibles"}`}
        </span>
        <Link
          href={perfil}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-300"
        >
          Ver clases
        </Link>
      </footer>
    </article>
  );
}
