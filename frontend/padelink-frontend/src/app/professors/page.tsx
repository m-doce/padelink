"use client";

import Link from "next/link";
import { useState } from "react";

// Mock types based on your entities
type Usuario = {
  nombre: string;
  apellido: string;
  email: string;
};

type Profesor = {
  id: number;
  usuario: Usuario;
  bio: string;
  precioPorClase: number;
  manoDominante: "diestro" | "zurdo";
  linkAjpp?: string;
  promedioCalificacion: number;
  imageUrl?: string; // Added for UI purposes, assuming we'll handle images later
};

// Mock Data
const MOCK_PROFESSORS: Profesor[] = [
  {
    id: 1,
    usuario: {
      nombre: "Santino",
      apellido: "Trípodi",
      email: "santino.tripodi@example.com",
    },
    bio: "LA BESTIA DEL PADEL",
    precioPorClase: 75000,
    manoDominante: "diestro",
    promedioCalificacion: 4.8,
    linkAjpp: "https://ajpp.com.ar/jugador/juan-martinez",
  },
  {
    id: 2,
    usuario: {
      nombre: "Lucía",
      apellido: "Fernández",
      email: "lucia.pro@example.com",
    },
    bio: "Ex jugadora profesional. Me enfoco en la técnica de golpeo y la preparación física específica para pádel. Clases dinámicas y divertidas.",
    precioPorClase: 4000,
    manoDominante: "zurdo",
    promedioCalificacion: 5.0,
  },
  {
    id: 3,
    usuario: {
      nombre: "Carlos",
      apellido: "Gómez",
      email: "carlos.coach@example.com",
    },
    bio: "Profesor de iniciación y nivel intermedio. Te ayudo a corregir vicios y mejorar tu confianza en el juego.",
    precioPorClase: 2800,
    manoDominante: "diestro",
    promedioCalificacion: 4.5,
  },
  {
    id: 4,
    usuario: {
      nombre: "Sofía",
      apellido: "Ruiz",
      email: "sofia.padel@example.com",
    },
    bio: "Clases grupales e individuales. Enfoque en estrategia de partido y mentalidad ganadora.",
    precioPorClase: 3200,
    manoDominante: "diestro",
    promedioCalificacion: 4.9,
  },
];

export default function ProfessorsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfessors = MOCK_PROFESSORS.filter((prof) => {
    const fullName = `${prof.usuario.nombre} ${prof.usuario.apellido}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
      {/* Navbar (Reusable component in future) */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 lg:px-12 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-lime-400 flex items-center justify-center">
            <span className="font-bold text-zinc-900">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight">PadeLink</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/professors" className="text-lime-600 dark:text-lime-400 font-semibold">
            Profesores
          </Link>
          <Link href="/login" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-zinc-900 px-4 py-2 text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"
          >
            Registrarse
          </Link>
        </nav>
      </header>

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

        {/* Grid Gallery */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProfessors.map((prof) => (
            <div
              key={prof.id}
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
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {prof.usuario.nombre} {prof.usuario.apellido}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {prof.manoDominante === "diestro" ? "Diestro ✋" : "Zurdo 🤚"}
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
                  <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500">
                    Ver Perfil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProfessors.length === 0 && (
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