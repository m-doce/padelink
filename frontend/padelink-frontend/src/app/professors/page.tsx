"use client";

import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProfesorCard from "@/components/profesores/ProfesorCard";
import PanelFiltros from "@/components/filtros/PanelFiltros";
import { Buscador, CampoFiltro, Chips, Interruptor, Selector } from "@/components/filtros/CamposFiltro";
import { CargandoTarjetas, MensajeError, SinResultados } from "@/components/ui/EstadosListado";
import { useApiGet } from "@/hooks/useApiGet";
import { useFiltros } from "@/hooks/useFiltros";
import { valoresUnicos } from "@/lib/filters";
import { formatPrecio } from "@/lib/format";
import { NIVELES } from "@/lib/clases";
import {
  CALIFICACIONES_MINIMAS,
  FILTROS_PROFESOR_POR_DEFECTO,
  MODALIDADES,
  ORDENES_PROFESOR,
  PRECIOS_MAXIMOS,
  enriquecerProfesores,
  predicadosDeProfesor,
  type OrdenProfesor,
} from "@/lib/profesores";
import type { ClaseListado, ProfesorResumen } from "@/types";

const ORDEN_OPCIONES = (Object.keys(ORDENES_PROFESOR) as OrdenProfesor[]).map((valor) => ({
  valor,
  etiqueta: ORDENES_PROFESOR[valor].etiqueta,
}));

const PRECIO_OPCIONES = [
  { valor: 0, etiqueta: "Sin límite" },
  ...PRECIOS_MAXIMOS.map((p) => ({ valor: p, etiqueta: `Hasta ${formatPrecio(p)}` })),
];

export default function ProfessorsPage() {
  const profesoresApi = useApiGet<ProfesorResumen[]>("/profesor");
  const clasesApi = useApiGet<ClaseListado[]>("/clase");

  // Se cruzan profesores y clases para saber dónde enseña cada uno y qué niveles
  const profesores = useMemo(
    () => enriquecerProfesores(profesoresApi.data ?? [], clasesApi.data ?? []),
    [profesoresApi.data, clasesApi.data],
  );

  const { filtros, cambiar, limpiar, resultados, activos } = useFiltros({
    items: profesores,
    porDefecto: FILTROS_PROFESOR_POR_DEFECTO,
    predicados: predicadosDeProfesor,
    ordenes: ORDENES_PROFESOR,
  });

  const ciudades = useMemo(() => valoresUnicos(clasesApi.data ?? [], (c) => c.club?.ciudad), [clasesApi.data]);
  const loading = profesoresApi.loading || clasesApi.loading;
  const error = profesoresApi.error || clasesApi.error;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-10 sm:px-6 lg:px-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Encontrá tu <span className="text-lime-600 dark:text-lime-400">profesor ideal</span>
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Compará profesores por zona, nivel, precio y opiniones de otros alumnos.
          </p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <PanelFiltros activos={activos} onLimpiar={limpiar}>
            <Buscador valor={filtros.busqueda} onCambiar={(v) => cambiar("busqueda", v)} placeholder="Buscar por nombre" />

            <CampoFiltro titulo="Ciudad">
              <Selector
                etiqueta="Ciudad"
                valor={filtros.ciudad}
                opciones={[{ valor: "", etiqueta: "Todas las ciudades" }, ...ciudades.map((c) => ({ valor: c, etiqueta: c }))]}
                onCambiar={(v) => cambiar("ciudad", v)}
              />
            </CampoFiltro>

            <CampoFiltro titulo="Nivel que enseña">
              <Selector
                etiqueta="Nivel que enseña"
                valor={filtros.nivel}
                opciones={[{ valor: "", etiqueta: "Todos los niveles" }, ...NIVELES.map((n) => ({ valor: n.id as string, etiqueta: n.etiqueta }))]}
                onCambiar={(v) => cambiar("nivel", v)}
              />
            </CampoFiltro>

            <CampoFiltro titulo="Modalidad y precio">
              <div className="space-y-2">
                <Selector
                  etiqueta="Modalidad"
                  valor={filtros.modalidad}
                  opciones={MODALIDADES.map((m) => ({ valor: m.id, etiqueta: m.etiqueta }))}
                  onCambiar={(v) => cambiar("modalidad", v)}
                />
                <Selector etiqueta="Precio máximo" valor={filtros.precioMaximo} opciones={PRECIO_OPCIONES} onCambiar={(v) => cambiar("precioMaximo", v)} />
              </div>
            </CampoFiltro>

            <CampoFiltro titulo="Calificación mínima">
              <Chips
                opciones={CALIFICACIONES_MINIMAS.map((c) => ({ valor: c.valor, etiqueta: c.valor ? `★ ${c.etiqueta}` : c.etiqueta }))}
                activo={(v) => filtros.calificacionMinima === v}
                onElegir={(v) => cambiar("calificacionMinima", v)}
              />
            </CampoFiltro>

            <Interruptor etiqueta="Solo con clases disponibles" activo={filtros.soloConClases} onCambiar={(v) => cambiar("soloConClases", v)} />
          </PanelFiltros>

          <section className="min-w-0 flex-1" aria-live="polite">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {loading ? "Buscando profesores..." : `${resultados.length} ${resultados.length === 1 ? "profesor" : "profesores"}`}
              </p>
              <div className="w-56">
                <Selector etiqueta="Ordenar por" valor={filtros.orden} opciones={ORDEN_OPCIONES} onCambiar={(v) => cambiar("orden", v)} />
              </div>
            </div>

            {loading ? (
              <CargandoTarjetas />
            ) : error ? (
              <MensajeError
                mensaje={error}
                onReintentar={() => {
                  profesoresApi.recargar();
                  clasesApi.recargar();
                }}
              />
            ) : resultados.length === 0 ? (
              <SinResultados mensaje="No encontramos profesores con esos filtros." onLimpiar={activos > 0 ? limpiar : undefined} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {resultados.map((p) => (
                  <ProfesorCard key={p.usuario_id} profesor={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
