"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

// Mock types based on your entities
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

export default function ProfessorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [professors, setProfessors] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const data = await api.get<Profesor[]>("/profesor");
        setProfessors(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar profesores");
      } finally {
        setLoading(false);
      }
    };
    fetchProfessors();
  }, []);

  const filteredProfessors = professors.filter((prof) => {
    const fullName = `${prof.usuario.nombre} ${prof.usuario.apellido}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
      <Navbar />

      <main className="container mx-auto px-6 py-12 lg:px-12">
        {/* Header Section */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Encuentra tu <span className="text-lime-600 dark:text-lime-400">Profesor Ideal</span>
            </h1>
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              Mejora tu nivel con los mejores entrenadores de la comunidad.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full rounded-full border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-lg text-zinc-500 animate-pulse">Cargando profesores...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProfessors.map((prof) => (
              <div
                key={prof.usuario_id}
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Card Header / Avatar Area */}
                <div className="relative h-32 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-800">
                  <div className="absolute -bottom-8 left-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-lime-100 text-2xl font-bold text-lime-700 dark:border-zinc-900 dark:bg-lime-900/50 dark:text-lime-400">
                      {prof.usuario.nombre[0]}
                      {prof.usuario.apellido[0]}
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-4 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm dark:bg-black/50 dark:text-white">
                    ⭐ {prof.promedioCalificacion}
                  </div>
                </div>

                {/* Card Body */}
                <div className="mt-10 flex flex-1 flex-col px-6 pb-6 pt-2">
                  <div className="mb-4">
                    <Link href={`/professors/${prof.usuario_id}`} className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        {prof.usuario.nombre} {prof.usuario.apellido}
                      </h3>
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {prof.manoDominante?.toLowerCase() === "diestro" ? "Diestro ✋" : "Zurdo 🤚"}
                      </span>
                      {prof.linkAjpp && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                          AJPP 🔗
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-6 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {prof.bio}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">Precio por clase</span>
                      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        ${prof.precioPorClase}
                      </span>
                    </div>
                    <Link 
                      href={`/professors/${prof.usuario_id}`}
                      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProfessors.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              No se encontraron profesores con ese nombre.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}