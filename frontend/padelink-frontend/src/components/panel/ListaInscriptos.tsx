import type { AlumnoInscripto } from "@/types";
import { formatNivel, nombreCompleto } from "@/lib/format";
import { Avatar, Etiqueta } from "@/components/ui/Elementos";

interface ListaInscriptosProps {
  alumnos: AlumnoInscripto[];
  /** Si se pasa, aparece un botón para quitar a cada alumno de la clase. */
  onQuitar?: (alumno: AlumnoInscripto) => void;
}

export default function ListaInscriptos({ alumnos, onQuitar }: ListaInscriptosProps) {
  if (alumnos.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Todavía no hay alumnos inscriptos.</p>;
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {alumnos.map((a) => (
        <li key={a.usuario_id} className="flex items-center gap-3 py-2.5">
          <Avatar usuario={a.usuario} tamano="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{a.usuario ? nombreCompleto(a.usuario) : `Alumno #${a.usuario_id}`}</p>
            {a.usuario?.email && <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{a.usuario.email}</p>}
          </div>
          {a.nivel && <Etiqueta>{formatNivel(a.nivel)}</Etiqueta>}
          {onQuitar && (
            <button type="button" onClick={() => onQuitar(a)} className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
              Quitar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
