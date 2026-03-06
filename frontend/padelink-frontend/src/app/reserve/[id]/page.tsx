"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// --- MOCK DATA ---
const MOCK_CLASE = {
  id: 101,
  profesor: {
    nombre: "Juan",
    apellido: "Martínez",
    precioPorClase: 3500,
  },
  club: {
    nombre: "Padel Club Central",
    direccion: "Av. Siempre Viva 123",
  },
  fecha_hora: new Date(new Date().setDate(new Date().getDate() + 1)),
  duracion_minutos: 60,
  nivel: 3,
  capacidad_maxima: 4,
  alumnos_inscritos: [{ id: 1, nombre: "Pedro" }, { id: 2, nombre: "Ana" }],
  descripcion: "Clase de nivel intermedio enfocada en volea y bandeja.",
};

export default function ReservePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // In a real app, fetch class details based on `id`
  const clase = MOCK_CLASE;

  const handleConfirmReservation = async () => {
    setSubmitting(true);
    // Simulating API call to POST /clase/:id/reserve
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center border border-zinc-200 dark:border-zinc-800 shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">¡Reserva Confirmada!</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-sm">
              Tu lugar en la clase de <b>{clase.profesor.nombre}</b> ha sido reservado con éxito. Te esperamos en <b>{clase.club.nombre}</b>.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/student"
                className="w-full bg-zinc-900 dark:bg-lime-400 text-white dark:text-zinc-900 py-3 rounded-xl font-bold transition hover:opacity-90"
              >
                Ver Mis Reservas
              </Link>
              <Link
                href="/"
                className="w-full bg-zinc-100 dark:bg-zinc-800 py-3 rounded-xl font-medium transition hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
      <Navbar />
      <main className="container mx-auto px-6 py-12 lg:px-12 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Summary Card */}
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Confirmar Reserva</h1>
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-16 h-16 bg-lime-100 dark:bg-lime-900/50 rounded-full flex items-center justify-center text-2xl font-bold text-lime-700 dark:text-lime-400">
                  {clase.profesor.nombre[0]}{clase.profesor.apellido[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{clase.profesor.nombre} {clase.profesor.apellido}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Profesor de Padel</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {clase.fecha_hora.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {clase.fecha_hora.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })} ({clase.duracion_minutos} min)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{clase.club.nombre}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{clase.club.direccion}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl">🎾</span>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Nivel {clase.nivel}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{clase.descripcion}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment/Confirm Sidebar */}
          <div className="w-full md:w-80">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-4">Resumen de Pago</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Precio de la clase</span>
                  <span>${clase.profesor.precioPorClase}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Cargos de servicio</span>
                  <span>$0</span>
                </div>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-lime-600 dark:text-lime-400">${clase.profesor.precioPorClase}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmReservation}
                disabled={submitting}
                className="w-full bg-zinc-900 dark:bg-lime-400 text-white dark:text-zinc-900 py-3 rounded-xl font-bold transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Confirmando..." : "Confirmar Reserva"}
              </button>
              
              <p className="text-[10px] text-zinc-500 text-center mt-4">
                Al confirmar, aceptas nuestras políticas de cancelación y términos de servicio.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
