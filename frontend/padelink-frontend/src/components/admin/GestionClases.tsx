"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import FilaClase from "@/components/panel/FilaClase";
import PanelFiltros from "@/components/filtros/PanelFiltros";
import { Buscador, CampoFiltro, Chips, Selector } from "@/components/filtros/CamposFiltro";
import { BOTON } from "@/components/panel/ElementosPanel";
import { SinResultados } from "@/components/ui/EstadosListado";
import DetalleClase from "./DetalleClase";
import { useFiltros } from "@/hooks/useFiltros";
import { api } from "@/lib/api";
import { valoresUnicos } from "@/lib/filters";
import { formatFechaCorta, nombreCompleto } from "@/lib/format";
import {
  ESTADOS_VISIBLES,
  FILTROS_CLASE_ADMIN_POR_DEFECTO,
  MOMENTOS,
  ORDENES_CLASE_ADMIN,
  predicadosClaseAdmin,
  type OrdenClaseAdmin,
} from "@/lib/clases";
import type { ClaseListado } from "@/types";

const ORDEN_OPCIONES = (Object.keys(ORDENES_CLASE_ADMIN) as OrdenClaseAdmin[]).map((valor) => ({ valor, etiqueta: ORDENES_CLASE_ADMIN[valor].etiqueta }));

interface GestionClasesProps {
  clases: ClaseListado[];
  onActualizada: (clase: ClaseListado) => void;
  onEliminada: (id: number) => void;
}

export default function GestionClases({ clases, onActualizada, onEliminada }: GestionClasesProps) {
  const { filtros, cambiar, limpiar, resultados, activos } = useFiltros({
    items: clases,
    porDefecto: FILTROS_CLASE_ADMIN_POR_DEFECTO,
    predicados: predicadosClaseAdmin,
    ordenes: ORDENES_CLASE_ADMIN,
  });
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [aEliminar, setAEliminar] = useState<ClaseListado | null>(null);

  // Opciones de los selects armadas a partir de las propias clases
  const profesores = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const c of clases) if (c.profesor) mapa.set(c.profesor.usuario_id, nombreCompleto(c.profesor.usuario));
    return [...mapa.entries()].map(([valor, etiqueta]) => ({ valor, etiqueta })).sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es"));
  }, [clases]);
  const clubes = useMemo(() => valoresUnicos(clases, (c) => c.club?.nombre), [clases]);

  const eliminar = async () => {
    if (!aEliminar) return;
    try {
      await api.delete(`/clase/${aEliminar.id}`);
      if (detalleId === aEliminar.id) setDetalleId(null);
      onEliminada(aEliminar.id);
      toast.success("Clase eliminada");
    } catch (err: unknown) {
      toast.error("No se pudo eliminar", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setAEliminar(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <PanelFiltros activos={activos} onLimpiar={limpiar}>
        <Buscador valor={filtros.busqueda} onCambiar={(v) => cambiar("busqueda", v)} placeholder="Profesor, club o ciudad" />

        <CampoFiltro titulo="Cuándo">
          <Chips opciones={MOMENTOS.map((m) => ({ valor: m.id, etiqueta: m.etiqueta }))} activo={(v) => filtros.momento === v} onElegir={(v) => cambiar("momento", v)} />
        </CampoFiltro>

        <CampoFiltro titulo="Estado">
          <Selector
            etiqueta="Estado"
            valor={filtros.estado}
            opciones={[{ valor: "" as const, etiqueta: "Todos los estados" }, ...ESTADOS_VISIBLES.map((e) => ({ valor: e.id, etiqueta: e.etiqueta }))]}
            onCambiar={(v) => cambiar("estado", v)}
          />
        </CampoFiltro>

        <CampoFiltro titulo="Tipo">
          <Chips
            opciones={[
              { valor: "", etiqueta: "Todas" },
              { valor: "GRUPAL", etiqueta: "Grupales" },
              { valor: "LIBRE", etiqueta: "Libres" },
            ]}
            activo={(v) => filtros.tipo === v}
            onElegir={(v) => cambiar("tipo", v)}
          />
        </CampoFiltro>

        <CampoFiltro titulo="Profesor">
          <Selector etiqueta="Profesor" valor={filtros.profesor} opciones={[{ valor: 0, etiqueta: "Todos los profesores" }, ...profesores]} onCambiar={(v) => cambiar("profesor", v)} />
        </CampoFiltro>

        <CampoFiltro titulo="Club">
          <Selector
            etiqueta="Club"
            valor={filtros.club}
            opciones={[{ valor: "", etiqueta: "Todos los clubes" }, ...clubes.map((c) => ({ valor: c, etiqueta: c }))]}
            onCambiar={(v) => cambiar("club", v)}
          />
        </CampoFiltro>
      </PanelFiltros>

      <section className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {resultados.length} {resultados.length === 1 ? "clase" : "clases"}
          </p>
          <div className="w-56">
            <Selector etiqueta="Ordenar clases" valor={filtros.orden} opciones={ORDEN_OPCIONES} onCambiar={(v) => cambiar("orden", v)} />
          </div>
        </div>

        {resultados.length === 0 ? (
          <SinResultados mensaje="No hay clases con esos filtros." onLimpiar={activos > 0 ? limpiar : undefined} />
        ) : (
          <div className="space-y-3">
            {resultados.map((clase) => (
              <FilaClase
                key={clase.id}
                clase={clase}
                mostrarProfesor
                acciones={
                  <>
                    <button type="button" onClick={() => setDetalleId(clase.id)} className={BOTON.secundario}>
                      Ver detalle
                    </button>
                    <button type="button" onClick={() => setAEliminar(clase)} className={BOTON.peligro}>
                      Eliminar
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>

      {detalleId !== null && (
        <DetalleClase
          claseId={detalleId}
          onCerrar={() => setDetalleId(null)}
          onActualizada={onActualizada}
          onEliminada={(id) => {
            setDetalleId(null);
            onEliminada(id);
          }}
        />
      )}

      <Modal
        isOpen={aEliminar !== null}
        onClose={() => setAEliminar(null)}
        onConfirm={eliminar}
        title="¿Eliminar clase?"
        description={
          aEliminar
            ? `Se borrará la clase del ${formatFechaCorta(new Date(aEliminar.fecha_hora))}${aEliminar.profesor ? ` de ${nombreCompleto(aEliminar.profesor.usuario)}` : ""} y sus ${aEliminar.alumnos_inscritos?.length ?? 0} reservas. No se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Volver"
        variant="danger"
      />
    </div>
  );
}
