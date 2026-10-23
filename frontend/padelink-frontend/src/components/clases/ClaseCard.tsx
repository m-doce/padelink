import Link from "next/link";
import type { ClaseListado, ProfesorResumen } from "@/types";
import { cuposLibres, estadoVisible, estaInscripto, preciosDeClase, type EstadoVisible } from "@/lib/clases";
import { formatDiaLargo, formatDuracion, formatHora, formatNivel, nombreCompleto } from "@/lib/format";
import { Avatar, Calificacion, Etiqueta, IconoUbicacion, ListaPrecios } from "@/components/ui/Elementos";

// Colores por tipo de clase. Las clases de Tailwind van completas para que el compilador las detecte.
const ACENTOS = {
  GRUPAL: { cabecera: "bg-lime-50 dark:bg-lime-900/20", texto: "text-lime-700 dark:text-lime-400", barra: "bg-lime-500", tono: "lima", nombre: "Grupal" },
  LIBRE: { cabecera: "bg-sky-50 dark:bg-sky-900/20", texto: "text-sky-700 dark:text-sky-400", barra: "bg-sky-500", tono: "azul", nombre: "Libre" },
} as const;

const TEXTO_BOTON: Record<Exclude<EstadoVisible, "disponible">, string> = {
  completa: "Clase completa",
  cancelada: "Clase cancelada",
  finalizada: "Clase finalizada",
};

interface ClaseCardProps {
  clase: ClaseListado;
  /** Si la clase no trae el profesor (por ejemplo, en su propio perfil), se pasa acá. */
  profesor?: ProfesorResumen;
  /** Oculta el bloque del profesor cuando ya se está viendo su perfil. */
  mostrarProfesor?: boolean;
  /** Id del alumno logueado, para indicar si ya está inscripto. */
  usuarioId?: number;
}

export default function ClaseCard({ clase, profesor = clase.profesor, mostrarProfesor = true, usuarioId }: ClaseCardProps) {
  const fecha = new Date(clase.fecha_hora);
  const acento = ACENTOS[clase.tipo_clase] ?? ACENTOS.GRUPAL;
  const estado = estadoVisible(clase);
  const libres = cuposLibres(clase);
  const ocupados = clase.capacidad_maxima - libres;
  const inscripto = estaInscripto(clase, usuarioId);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Cuándo */}
      <header className={`${acento.cabecera} flex items-start justify-between gap-3 px-5 py-4`}>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${acento.texto}`}>{formatDiaLargo(fecha)}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums">
            {formatHora(fecha)}
            <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">{formatDuracion(clase.duracion_minutos)}</span>
          </p>
        </div>
        <Etiqueta tono={acento.tono}>{acento.nombre}</Etiqueta>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Dónde y con quién */}
        <div className="space-y-3">
          {clase.club && (
            <p className="flex items-start gap-1.5 text-sm">
              <IconoUbicacion className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                <span className="font-medium">{clase.club.nombre}</span>
                {clase.club.ciudad && <span className="text-zinc-500 dark:text-zinc-400"> · {clase.club.ciudad}</span>}
              </span>
            </p>
          )}

          {mostrarProfesor && profesor && (
            <Link href={`/professors/${profesor.usuario_id}`} className="group flex items-center gap-2.5">
              <Avatar usuario={profesor.usuario} tamano="sm" />
              <span className="text-sm font-medium group-hover:text-lime-600 group-hover:underline dark:group-hover:text-lime-400">
                {nombreCompleto(profesor.usuario)}
              </span>
              <Calificacion valor={profesor.promedioCalificacion} />
            </Link>
          )}

          <div className="flex flex-wrap gap-2">
            <Etiqueta>{formatNivel(clase.nivel)}</Etiqueta>
          </div>

          {clase.descripcion && <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{clase.descripcion}</p>}
        </div>

        {/* Lugares */}
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{libres === 0 ? "Sin lugares" : `${libres} ${libres === 1 ? "lugar libre" : "lugares libres"}`}</span>
            <span className="tabular-nums">
              {ocupados}/{clase.capacidad_maxima}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full ${libres === 0 ? "bg-red-500" : acento.barra}`}
              style={{ width: `${clase.capacidad_maxima ? (ocupados / clase.capacidad_maxima) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Precio y acción */}
        <div className="mt-auto space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <ListaPrecios lineas={preciosDeClase(clase, profesor)} />
          <BotonReserva claseId={clase.id} estado={estado} inscripto={inscripto} />
        </div>
      </div>
    </article>
  );
}

function BotonReserva({ claseId, estado, inscripto }: { claseId: number; estado: EstadoVisible; inscripto: boolean }) {
  const base = "block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition";

  if (inscripto) {
    return (
      <Link href="/dashboard/student" className={`${base} border border-lime-500 text-lime-700 hover:bg-lime-50 dark:text-lime-400 dark:hover:bg-lime-900/20`}>
        ✓ Ya estás inscripto
      </Link>
    );
  }

  if (estado !== "disponible") {
    return (
      <span aria-disabled className={`${base} cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500`}>
        {TEXTO_BOTON[estado]}
      </span>
    );
  }

  return (
    <Link href={`/reserve/${claseId}`} className={`${base} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-300`}>
      Reservar
    </Link>
  );
}
