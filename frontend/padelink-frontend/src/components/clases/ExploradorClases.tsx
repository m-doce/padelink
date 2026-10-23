"use client";

import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import ClaseCard from "@/components/clases/ClaseCard";
import PanelFiltros from "@/components/filtros/PanelFiltros";
import { Buscador, CampoFiltro, Chips, Interruptor, Selector } from "@/components/filtros/CamposFiltro";
import { CargandoTarjetas, MensajeError, SinResultados } from "@/components/ui/EstadosListado";
import { useApiGet } from "@/hooks/useApiGet";
import { useFiltros } from "@/hooks/useFiltros";
import { useAuth } from "@/context/AuthContext";
import { valoresUnicos } from "@/lib/filters";
import {
  DIAS_SEMANA,
  FILTROS_CLASE_POR_DEFECTO,
  FRANJAS_HORARIAS,
  NIVELES,
  ORDENES_CLASE,
  RANGOS_FECHA,
  predicadosDeClase,
  type OrdenClase,
} from "@/lib/clases";
import type { ClaseListado, TipoClase } from "@/types";

/** Configuración de cada listado de clases. Para sumar un tipo nuevo alcanza con agregar una entrada. */
export const LISTADOS_CLASE: Record<TipoClase, { endpoint: string; titulo: string; resaltado: string; descripcion: string; colorTitulo: string }> = {
  GRUPAL: {
    endpoint: "/clase/grupales",
    titulo: "Clases",
    resaltado: "Grupales",
    descripcion: "Entrená en grupo con un profesor y jugadores de tu nivel. Pagás por persona.",
    colorTitulo: "text-lime-600 dark:text-lime-400",
  },
  LIBRE: {
    endpoint: "/clase/libres",
    titulo: "Clases",
    resaltado: "Libres",
    descripcion: "Reservá el turno del profesor para vos solo o para tu grupo de hasta 4 personas.",
    colorTitulo: "text-sky-600 dark:text-sky-400",
  },
};

const ORDEN_OPCIONES = (Object.keys(ORDENES_CLASE) as OrdenClase[]).map((valor) => ({ valor, etiqueta: ORDENES_CLASE[valor].etiqueta }));

export default function ExploradorClases({ tipo }: { tipo: TipoClase }) {
  const config = LISTADOS_CLASE[tipo];
  const { user } = useAuth();
  const { data, loading, error, recargar } = useApiGet<ClaseListado[]>(config.endpoint);
  const clases = useMemo(() => data ?? [], [data]);

  const { filtros, cambiar, alternar, limpiar, resultados, activos } = useFiltros({
    items: clases,
    porDefecto: FILTROS_CLASE_POR_DEFECTO,
    predicados: predicadosDeClase,
    ordenes: ORDENES_CLASE,
  });

  const clubes = useMemo(() => valoresUnicos(clases, (c) => c.club?.nombre), [clases]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-10 sm:px-6 lg:px-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {config.titulo} <span className={config.colorTitulo}>{config.resaltado}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{config.descripcion}</p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <PanelFiltros activos={activos} onLimpiar={limpiar}>
            <Buscador valor={filtros.busqueda} onCambiar={(v) => cambiar("busqueda", v)} placeholder="Profesor, club o ciudad" />

            <CampoFiltro titulo="Fecha">
              <Selector
                etiqueta="Fecha"
                valor={filtros.rangoFecha}
                opciones={RANGOS_FECHA.map((r) => ({ valor: r.id, etiqueta: r.etiqueta }))}
                onCambiar={(v) => cambiar("rangoFecha", v)}
              />
            </CampoFiltro>

            <CampoFiltro titulo="Día de la semana">
              <Chips
                opciones={DIAS_SEMANA.map((d) => ({ valor: d.id, etiqueta: d.etiqueta }))}
                activo={(v) => filtros.dias.includes(v)}
                onElegir={(v) => alternar("dias", v)}
              />
            </CampoFiltro>

            <CampoFiltro titulo="Horario">
              <Chips
                opciones={FRANJAS_HORARIAS.map((f) => ({ valor: f.id, etiqueta: f.etiqueta, detalle: f.detalle }))}
                activo={(v) => filtros.franjas.includes(v)}
                onElegir={(v) => alternar("franjas", v)}
              />
            </CampoFiltro>

            <CampoFiltro titulo="Nivel">
              <Selector
                etiqueta="Nivel"
                valor={filtros.nivel}
                opciones={[{ valor: "", etiqueta: "Todos los niveles" }, ...NIVELES.map((n) => ({ valor: n.id as string, etiqueta: n.etiqueta }))]}
                onCambiar={(v) => cambiar("nivel", v)}
              />
            </CampoFiltro>

            <CampoFiltro titulo="Club">
              <Selector
                etiqueta="Club"
                valor={filtros.club}
                opciones={[{ valor: "", etiqueta: "Todos los clubes" }, ...clubes.map((c) => ({ valor: c, etiqueta: c }))]}
                onCambiar={(v) => cambiar("club", v)}
              />
            </CampoFiltro>

            <Interruptor etiqueta="Solo con lugares libres" activo={filtros.soloConLugares} onCambiar={(v) => cambiar("soloConLugares", v)} />
          </PanelFiltros>

          <section className="min-w-0 flex-1" aria-live="polite">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {loading ? "Buscando clases..." : `${resultados.length} ${resultados.length === 1 ? "clase" : "clases"} próximas`}
              </p>
              <div className="w-48">
                <Selector etiqueta="Ordenar por" valor={filtros.orden} opciones={ORDEN_OPCIONES} onCambiar={(v) => cambiar("orden", v)} />
              </div>
            </div>

            {loading ? (
              <CargandoTarjetas />
            ) : error ? (
              <MensajeError mensaje={error} onReintentar={recargar} />
            ) : resultados.length === 0 ? (
              <SinResultados
                mensaje={activos > 0 ? "No hay clases que coincidan con los filtros." : "No hay clases próximas por el momento."}
                onLimpiar={activos > 0 ? limpiar : undefined}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {resultados.map((clase) => (
                  <ClaseCard key={clase.id} clase={clase} usuarioId={user?.usuario_id} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
