"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Types basados en el backend
type Usuario = {
  nombre: string;
  apellido: string;
};

type Profesor = {
  precioClaseGrupal: number;
  precioClaseIndividual: number;
  usuario: Usuario;
};

type Club = {
  nombre: string;
  ubicacion: string;
};

type Clase = {
  id: number;
  fecha_hora: string;
  duracion_minutos: number;
  nivel: string;
  capacidad_maxima: number;
  descripcion: string;
  tipo_clase: "GRUPAL" | "LIBRE";
  profesor: Profesor;
  club: Club;
  alumnos_inscritos: any[];
};

export default function ClasesLibres() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClases = async () => {
      try {
        const data = await api.get<Clase[]>("/clase/libres");
        setClases(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar las clases libres");
      } finally {
        setLoading(false);
      }
    };
    fetchClases();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-12 lg:px-12">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">
          Clases <span className="text-blue-600 dark:text-blue-400">Libres</span>
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-lg text-zinc-500 animate-pulse">Cargando clases...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500">
            <p>{error}</p>
          </div>
        ) : clases.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-zinc-500">No hay clases libres disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clases.map((clase) => {
              const fecha = new Date(clase.fecha_hora);
              const cuposDisponibles = clase.capacidad_maxima - clase.alumnos_inscritos.length;

              return (
                <Link
                  key={clase.id}
                  href={`/reserve/${clase.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Cabecera con horario y ubicación destacados */}
                  <div className="bg-blue-50 p-6 dark:bg-blue-900/20">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                      {fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                      {fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {clase.club.nombre}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{clase.club.ubicacion}</p>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-6">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {clase.profesor.usuario.nombre} {clase.profesor.usuario.apellido}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      {clase.nivel ? `Nivel ${clase.nivel}` : "Sin nivel"} • {clase.duracion_minutos} min
                    </p>
                    {clase.descripcion && (
                      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {clase.descripcion}
                      </p>
                    )}

                    {/* Precios y cupos */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-500">Individual</span>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          ${clase.profesor.precioClaseIndividual}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-500">Grupal (max 4)</span>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          ${clase.profesor.precioClaseGrupal}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        cuposDisponibles > 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {cuposDisponibles === 0 ? "Completa" : `${cuposDisponibles} cupos disponibles`}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto px-6 text-center text-sm text-zinc-500 dark:text-zinc-400 lg:px-12">
          <p>&copy; {new Date().getFullYear()} PadeLink. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
