"use client";

import { useState, type ReactNode } from "react";
import type { ClaseListado } from "@/types";
import { cuposLibres } from "@/lib/clases";
import { formatDuracion, formatHora, formatNivel, nombreCompleto } from "@/lib/format";
import { Etiqueta, IconoUbicacion } from "@/components/ui/Elementos";
import { EtiquetaEstado } from "./ElementosPanel";

interface FilaClaseProps {
  clase: ClaseListado;
  /** Muestra con qué profesor es la clase (útil para alumno y admin). */
  mostrarProfesor?: boolean;
  /** Muestra "x/y inscriptos". El alumno no lo ve: sus reservas no traen a los demás inscriptos. */
  mostrarInscriptos?: boolean;
  /** Botones de la derecha: cada panel decide qué acciones ofrece. */
  acciones?: ReactNode;
  /** Contenido desplegable (por ejemplo, la lista de inscriptos). */
  detalle?: ReactNode;
  etiquetaDetalle?: string;
}

/** Fila compacta de una clase para los paneles: cuándo, dónde, cuántos y qué se puede hacer. */
export default function FilaClase({ clase, mostrarProfesor = false, mostrarInscriptos = true, acciones, detalle, etiquetaDetalle = "Ver inscriptos" }: FilaClaseProps) {
  const [abierta, setAbierta] = useState(false);
  const fecha = new Date(clase.fecha_hora);
  const inscriptos = clase.capacidad_maxima - cuposLibres(clase);

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        {/* Fecha */}
        <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-zinc-50 py-2 dark:bg-zinc-800/70">
          <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            {fecha.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")}
          </span>
          <span className="text-2xl font-bold leading-tight">{fecha.getDate()}</span>
          <span className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
            {fecha.toLocaleDateString("es-AR", { month: "short" }).replace(".", "")}
          </span>
        </div>

        {/* Datos */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold tabular-nums">{formatHora(fecha)}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{formatDuracion(clase.duracion_minutos)}</span>
            <EtiquetaEstado clase={clase} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {clase.club && (
              <span className="inline-flex items-center gap-1">
                <IconoUbicacion className="h-3.5 w-3.5" />
                {clase.club.nombre}
              </span>
            )}
            {mostrarProfesor && clase.profesor && <span>Prof. {nombreCompleto(clase.profesor.usuario)}</span>}
            {mostrarInscriptos && (
              <span className="tabular-nums">
                {inscriptos}/{clase.capacidad_maxima} inscriptos
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Etiqueta tono={clase.tipo_clase === "LIBRE" ? "azul" : "lima"}>{clase.tipo_clase === "LIBRE" ? "Libre" : "Grupal"}</Etiqueta>
            <Etiqueta>{formatNivel(clase.nivel)}</Etiqueta>
          </div>
        </div>

        {/* Acciones */}
        {(acciones || detalle) && (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {detalle && (
              <button type="button" onClick={() => setAbierta((v) => !v)} aria-expanded={abierta} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                {etiquetaDetalle}
                <svg className={`h-4 w-4 transition ${abierta ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            {acciones}
          </div>
        )}
      </div>

      {detalle && abierta && <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">{detalle}</div>}
    </article>
  );
}
