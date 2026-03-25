"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

// --- TYPES ---
type Usuario = {
  nombre: string;
  apellido: string;
  email: string;
};

type Profesor = {
  usuario_id: number;
  usuario: Usuario;
  bio: string;
  precioPorClase: string;
  manoDominante: "diestro" | "zurdo";
  linkAjpp?: string;
  promedioCalificacion: string;
  imageUrl?: string;
};

type Club = {
  id: number;
  nombre: string;
  direccion: string;
};

type Alumno = {
  usuario_id: number;
  nombre: string;
};

type Clase = {
  id: number;
  club: Club;
  fecha_hora: string;
  duracion_minutos: number;
  nivel: string;
  capacidad_maxima: number;
  descripcion: string;
  alumnos_inscritos: Alumno[];
  estado: "DISPONIBLE" | "CANCELADA" | "COMPLETA";
};

export default function ProfessorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [professor, setProfessor] = useState<Profesor | null>(null);
  const [classes, setClasses] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profData, classesData] = await Promise.all([
          api.get<Profesor>(`/profesor/${id}`),
          api.get<Clase[]>(`/clase/profesor/${id}`)
        ]);
        setProfessor(profData);
        setClasses(classesData);
      } catch (err: any) {
        setError(err.message || "Error al cargar datos del profesor");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-zinc-500 animate-pulse">Cargando perfil...</p>
      </div>
    </div>
  );

  if (error || !professor) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="flex items-center justify-center py-20 text-red-500">
        <p>{error || "Profesor no encontrado"}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
       <Navbar />

      <main className="container mx-auto px-6 py-12 lg:px-12">
        {/* Professor Header Profile */}
        <div className="mb-12 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
               <div className="flex h-32 w-32 items-center justify-center rounded-full bg-lime-100 text-4xl font-bold text-lime-700 dark:bg-lime-900/50 dark:text-lime-400 border-4 border-white dark:border-zinc-800 shadow-lg">
                  {professor.usuario.nombre[0]}{professor.usuario.apellido[0]}
               </div>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {professor.usuario.nombre} {professor.usuario.apellido}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {professor.manoDominante?.toLowerCase() === "diestro" ? "Diestro ✋" : "Zurdo 🤚"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      ★ {professor.promedioCalificacion}
                    </span>
                     {professor.linkAjpp && (
                      <a href={professor.linkAjpp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:underline dark:bg-blue-900/20 dark:text-blue-400">
                        AJPP Profile 🔗
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-sm text-zinc-500 dark:text-zinc-400">Precio base</span>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">${professor.precioPorClase}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400"> / clase</span>
                </div>
              </div>
              
              <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
                {professor.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Classes Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Clases Disponibles
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {classes.length}
            </span>
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((clase) => {
              const spotsTaken = clase.alumnos_inscritos.length;
              const spotsTotal = clase.capacidad_maxima;
              const spotsLeft = spotsTotal - spotsTaken;
              const isFull = spotsLeft <= 0;
              const isCancelled = clase.estado === "CANCELADA";
              const fecha = new Date(clase.fecha_hora);

              return (
                <div 
                  key={clase.id} 
                  className={`group relative flex flex-col rounded-xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 
                    ${isCancelled ? 'border-red-200 dark:border-red-900/30 opacity-75' : 'border-zinc-200 dark:border-zinc-800'}
                  `}
                >
                  {/* Availability Badge */}
                  <div className="absolute right-4 top-4">
                    {isCancelled ? (
                       <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/20 dark:text-red-400">
                         Cancelada
                       </span>
                    ) : isFull ? (
                      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-400">
                        Completa
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-lime-50 px-2 py-1 text-xs font-medium text-lime-700 ring-1 ring-inset ring-lime-600/20 dark:bg-lime-900/20 dark:text-lime-400">
                        {spotsLeft} lugare{spotsLeft !== 1 ? 's' : ''} libre{spotsLeft !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex flex-col h-full">
                    {/* Date & Time */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-lime-600 dark:text-lime-400 uppercase tracking-wide">
                        {fecha.toLocaleDateString("es-ES")}
                      </p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        {fecha.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                        ⏱ {clase.duracion_minutos} min
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                         <div className="h-5 w-5 text-zinc-400 text-center text-sm font-bold border border-zinc-300 rounded flex items-center justify-center">N</div>
                         <p className="text-sm text-zinc-700 dark:text-zinc-300">Nivel {clase.nivel}</p>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 italic border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
                        "{clase.descripcion}"
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <Link
                        href={`/reserve/${clase.id}`}
                        className={`w-full block text-center rounded-lg py-2.5 text-sm font-semibold transition 
                          ${isFull || isCancelled 
                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-800" 
                            : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"}
                        `}
                      >
                        {isFull ? "Lista de espera" : isCancelled ? "No disponible" : "Reservar Lugar"}
                      </Link>
                    </div>
                  </div>
                  
                  {/* Progress Bar for Capacity */}
                  {!isCancelled && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-b-xl overflow-hidden">
                       <div 
                         className={`h-full ${isFull ? 'bg-red-500' : 'bg-lime-500'}`} 
                         style={{ width: `${(spotsTaken / spotsTotal) * 100}%` }}
                       ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
