"use client";

import { useState } from "react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import ListaInscriptos from "@/components/panel/ListaInscriptos";
import { BOTON, EtiquetaEstado } from "@/components/panel/ElementosPanel";
import { Avatar, Etiqueta, ListaPrecios } from "@/components/ui/Elementos";
import { useApiGet } from "@/hooks/useApiGet";
import { api } from "@/lib/api";
import { cuposLibres, preciosDeClase } from "@/lib/clases";
import { formatDiaLargo, formatDuracion, formatHora, formatNivel, nombreCompleto } from "@/lib/format";
import type { AlumnoInscripto, ClaseListado } from "@/types";

interface DetalleClaseProps {
  claseId: number;
  onCerrar: () => void;
  onActualizada: (clase: ClaseListado) => void;
  onEliminada: (id: number) => void;
}

type Confirmacion = { tipo: "cancelar" } | { tipo: "eliminar" } | { tipo: "quitar"; alumno: AlumnoInscripto } | null;

/** Detalle completo de una clase para el admin: datos, inscriptos y acciones. */
export default function DetalleClase({ claseId, onCerrar, onActualizada, onEliminada }: DetalleClaseProps) {
  // Se pide la clase completa porque el listado no trae los datos de cada inscripto
  const { data: clase, loading, error, recargar } = useApiGet<ClaseListado>(`/clase/${claseId}`);
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);

  const ejecutar = async () => {
    if (!clase || !confirmacion) return;
    try {
      if (confirmacion.tipo === "eliminar") {
        await api.delete(`/clase/${clase.id}`);
        toast.success("Clase eliminada");
        onEliminada(clase.id);
        return;
      }
      if (confirmacion.tipo === "cancelar") {
        await api.patch(`/clase/${clase.id}`, { estado: "CANCELADA" });
        toast.success("Clase cancelada", { description: "Ya no se muestra a los alumnos." });
      } else {
        await api.delete(`/clase/${clase.id}/reserve/${confirmacion.alumno.usuario_id}`);
        toast.success("Alumno quitado de la clase");
      }
      const actualizada = await api.get<ClaseListado>(`/clase/${clase.id}`);
      onActualizada(actualizada);
      await recargar({ silencioso: true });
    } catch (err: unknown) {
      toast.error("No se pudo completar la acción", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setConfirmacion(null);
    }
  };

  const fecha = clase ? new Date(clase.fecha_hora) : null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titulo-detalle-clase" onClick={onCerrar}>
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-100 bg-white/90 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
          <h2 id="titulo-detalle-clase" className="text-lg font-bold">
            Detalle de la clase
          </h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : error || !clase || !fecha ? (
          <p className="p-6 text-red-600">{error || "No se encontró la clase."}</p>
        ) : (
          <div className="space-y-6 p-6">
            {/* Cuándo y estado */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Etiqueta tono={clase.tipo_clase === "LIBRE" ? "azul" : "lima"}>{clase.tipo_clase === "LIBRE" ? "Libre" : "Grupal"}</Etiqueta>
                <EtiquetaEstado clase={clase} />
                <span className="text-xs text-zinc-400">#{clase.id}</span>
              </div>
              <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-lime-700 dark:text-lime-400">{formatDiaLargo(fecha)}</p>
              <p className="text-3xl font-bold tabular-nums">
                {formatHora(fecha)} <span className="text-base font-normal text-zinc-500">· {formatDuracion(clase.duracion_minutos)}</span>
              </p>
            </div>

            {/* Datos */}
            <dl className="grid grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-800/50">
              <div className="col-span-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Profesor</dt>
                <dd className="mt-1 flex items-center gap-2 font-medium">
                  {clase.profesor && <Avatar usuario={clase.profesor.usuario} tamano="sm" />}
                  {clase.profesor ? nombreCompleto(clase.profesor.usuario) : "—"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Club</dt>
                <dd className="font-medium">
                  {clase.club?.nombre ?? "—"}
                  {clase.club?.ubicacion && <span className="block text-xs font-normal text-zinc-500">{[clase.club.ubicacion, clase.club.ciudad].filter(Boolean).join(" · ")}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Nivel</dt>
                <dd className="font-medium">{formatNivel(clase.nivel)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Lugares</dt>
                <dd className="font-medium tabular-nums">
                  {clase.capacidad_maxima - cuposLibres(clase)} de {clase.capacidad_maxima} ocupados
                </dd>
              </div>
              {clase.descripcion && (
                <div className="col-span-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">Descripción</dt>
                  <dd>{clase.descripcion}</dd>
                </div>
              )}
              <div className="col-span-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                <ListaPrecios lineas={preciosDeClase(clase)} />
              </div>
            </dl>

            {/* Inscriptos */}
            <div>
              <h3 className="mb-2 font-semibold">Inscriptos ({clase.alumnos_inscritos?.length ?? 0})</h3>
              <ListaInscriptos alumnos={clase.alumnos_inscritos ?? []} onQuitar={(alumno) => setConfirmacion({ tipo: "quitar", alumno })} />
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              {clase.estado !== "CANCELADA" && (
                <button type="button" onClick={() => setConfirmacion({ tipo: "cancelar" })} className={BOTON.secundario}>
                  Cancelar clase
                </button>
              )}
              <button type="button" onClick={() => setConfirmacion({ tipo: "eliminar" })} className={BOTON.peligro}>
                Eliminar clase
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>

      <Modal
        isOpen={confirmacion !== null}
        onClose={() => setConfirmacion(null)}
        onConfirm={ejecutar}
        title={confirmacion?.tipo === "eliminar" ? "¿Eliminar clase?" : confirmacion?.tipo === "cancelar" ? "¿Cancelar clase?" : "¿Quitar alumno?"}
        description={
          confirmacion?.tipo === "eliminar"
            ? "Se borrará la clase y todas sus reservas. No se puede deshacer."
            : confirmacion?.tipo === "cancelar"
              ? "La clase quedará como cancelada y dejará de mostrarse a los alumnos. Las reservas se conservan en el historial."
              : confirmacion?.tipo === "quitar" && confirmacion.alumno.usuario
                ? `${nombreCompleto(confirmacion.alumno.usuario)} dejará de estar inscripto en esta clase.`
                : ""
        }
        confirmLabel={confirmacion?.tipo === "eliminar" ? "Eliminar" : confirmacion?.tipo === "cancelar" ? "Cancelar clase" : "Quitar"}
        cancelLabel="Volver"
        variant="danger"
      />
    </>
  );
}
