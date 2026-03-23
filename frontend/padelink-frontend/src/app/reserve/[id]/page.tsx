"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

// --- TYPES ---
type Clase = {
  id: number;
  profesor: {
    usuario: { nombre: string; apellido: string };
    precioPorClase: number;
  };
  fecha_hora: string;
  duracion_minutos: number;
  nivel: string;
  capacidad_maxima: number;
  alumnos_inscritos: any[];
  descripcion: string;
};

export default function ReservePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [clase, setClase] = useState<Clase | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClase = async () => {
      try {
        const data = await api.get<Clase>(`/clase/${id}`);
        setClase(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar los detalles de la clase");
      } finally {
        setLoading(false);
      }
    };
    fetchClase();
  }, [id]);

  const handleConfirmReservation = async () => {
    if (!clase) return;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push("/login");
      return;
    }
    
    const user = JSON.parse(userStr);
    setSubmitting(true);
    setError("");

    try {
      await api.post(`/clase/${id}/reserve`, { alumnoId: user.usuario_id });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "No se pudo confirmar la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-zinc-500 animate-pulse">Cargando detalles de la reserva...</p>
      </div>
    </div>
  );

  if (error && !success) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <p className="mb-4">{error}</p>
        <Link href="/professors" className="text-zinc-900 dark:text-white underline">Volver a profesores</Link>
      </div>
    </div>
  );

  if (!clase) return null;

  const fecha = new Date(clase.fecha_hora);

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
              Tu lugar en la clase de <b>{clase.profesor?.usuario?.nombre}</b> ha sido reservado con éxito.
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
                <div className="w-16 h-16 bg-lime-100 dark:bg-lime-900/50 rounded-full flex items-center justify-center text-2xl font-bold text-lime-700 dark:dark:text-lime-400">
                  {clase.profesor?.usuario?.nombre?.[0]}{clase.profesor?.usuario?.apellido?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{clase.profesor?.usuario?.nombre} {clase.profesor?.usuario?.apellido}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Profesor de Padel</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {fecha.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {fecha.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })} ({clase.duracion_minutos} min)
                      </p>
                    </div>
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
                  <span>${clase.profesor?.precioPorClase}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Cargos de servicio</span>
                  <span>$0</span>
                </div>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-lime-600 dark:text-lime-400">${clase.profesor?.precioPorClase}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmReservation}
                disabled={submitting}
                className="w-full bg-zinc-900 dark:bg-lime-400 text-white dark:text-zinc-900 py-3 rounded-xl font-bold transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Confirmando..." : "Confirmar Reserva"}
              </button>
              
              {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
              
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
