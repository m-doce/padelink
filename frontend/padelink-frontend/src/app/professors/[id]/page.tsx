"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ReviewsSection from "@/components/ReviewsSection";
import ClaseCard from "@/components/clases/ClaseCard";
import { Avatar, Calificacion, Etiqueta } from "@/components/ui/Elementos";
import { CargandoTarjetas, MensajeError, SinResultados } from "@/components/ui/EstadosListado";
import { useAuth } from "@/context/AuthContext";
import { useApiGet } from "@/hooks/useApiGet";
import { aplicarFiltros, ordenar } from "@/lib/filters";
import { ORDENES_CLASE, estaInscripto, soloProximas } from "@/lib/clases";
import { formatPrecio, nombreCompleto } from "@/lib/format";
import type { ClaseListado, ProfesorResumen } from "@/types";

function PrecioDestacado({ etiqueta, detalle, monto }: { etiqueta: string; detalle: string; monto: ProfesorResumen["precioClaseGrupal"] }) {
  return (
    <div className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{etiqueta}</p>
      <p className="text-xl font-bold tabular-nums">{formatPrecio(monto)}</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">{detalle}</p>
    </div>
  );
}

export default function ProfessorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const profesorApi = useApiGet<ProfesorResumen>(`/profesor/${id}`);
  const clasesApi = useApiGet<ClaseListado[]>(`/clase/profesor/${id}`);
  const profesor = profesorApi.data;
  const clases = useMemo(() => clasesApi.data ?? [], [clasesApi.data]);

  const proximas = useMemo(
    () => ordenar(aplicarFiltros(clases, [soloProximas(new Date())]), ORDENES_CLASE.fecha.comparar),
    [clases],
  );

  // Para habilitar la reseña alcanza con haber estado inscripto en cualquier clase del profesor
  const alumnoTomoClase = user?.tipoUsuario === "ALUMNO" && clases.some((c) => estaInscripto(c, user.usuario_id));

  if (profesorApi.loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-12">
          <CargandoTarjetas cantidad={3} />
        </main>
      </div>
    );
  }

  if (profesorApi.error || !profesor) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-12">
          <MensajeError mensaje={profesorApi.error || "Profesor no encontrado"} onReintentar={profesorApi.recargar} />
        </main>
      </div>
    );
  }

  const mano = profesor.manoDominante?.toLowerCase();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-12">
        <Link href="/professors" className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          ← Volver a profesores
        </Link>

        {/* Cabecera del perfil */}
        <section className="mb-12 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Avatar usuario={profesor.usuario} tamano="lg" />

            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold">{nombreCompleto(profesor.usuario)}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Calificacion valor={profesor.promedioCalificacion} />
                {mano && <Etiqueta>{mano === "zurdo" ? "Zurdo" : "Diestro"}</Etiqueta>}
                {profesor.linkAjpp && (
                  <a href={profesor.linkAjpp} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400">
                    Perfil AJPP ↗
                  </a>
                )}
              </div>
              <p className="mt-4 max-w-3xl leading-relaxed text-zinc-600 dark:text-zinc-400">{profesor.bio || "Sin descripción disponible."}</p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 md:w-72">
              <PrecioDestacado etiqueta="Clase grupal" detalle="por persona" monto={profesor.precioClaseGrupal} />
              <PrecioDestacado etiqueta="Clase individual" detalle="por clase" monto={profesor.precioClaseIndividual} />
            </div>
          </div>
        </section>

        {/* Próximas clases */}
        <section>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            Próximas clases
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {proximas.length}
            </span>
          </h2>

          {clasesApi.loading ? (
            <CargandoTarjetas cantidad={3} />
          ) : clasesApi.error ? (
            <MensajeError mensaje={clasesApi.error} onReintentar={clasesApi.recargar} />
          ) : proximas.length === 0 ? (
            <SinResultados mensaje="Este profesor no tiene clases próximas por el momento." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {proximas.map((clase) => (
                <ClaseCard key={clase.id} clase={clase} profesor={profesor} mostrarProfesor={false} usuarioId={user?.usuario_id} />
              ))}
            </div>
          )}
        </section>

        <ReviewsSection profesorId={profesor.usuario_id} alumnoTomoClase={alumnoTomoClase} onChange={() => profesorApi.recargar({ silencioso: true })} />
      </main>
    </div>
  );
}
