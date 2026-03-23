"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

// --- TYPES ---
type AlumnoProfile = {
  fecha_nacimiento: string;
  nivel: string;
  mano_dominante: string;
  genero: string;
  posicion: string;
  promedio_calificacion: number;
};

// Helper to calculate age from date string
function calculateAge(birthDate: string) {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

type Reserva = {
  id: number;
  profesor: {
    usuario: { nombre: string; apellido: string };
  };
  club: { nombre: string };
  fecha_hora: string;
  duracion_minutos: number;
  nivel: string;
  estado: string;
};

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<"reservations" | "profile">("reservations");
  const [profile, setProfile] = useState<AlumnoProfile | null>(null);
  const [reservations, setReservations] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      try {
        const [profData, resData] = await Promise.all([
          api.get<AlumnoProfile>(`/alumno/${user.usuario_id}`),
          api.get<Reserva[]>(`/clase/alumno/${user.usuario_id}`)
        ]);
        setProfile(profData);
        setReservations(resData);
      } catch (err: any) {
        setError(err.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancelReservation = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr!);
      try {
        await api.delete(`/clase/${id}/reserve/${user.usuario_id}`); 
        setReservations(reservations.filter((r) => r.id !== id));
        alert("Reserva cancelada correctamente");
      } catch (err: any) {
        alert(err.message || "No se pudo cancelar la reserva");
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr!);

    try {
      const payload = {
        ...profile,
        edad: calculateAge(profile.fecha_nacimiento)
      };
      await api.patch(`/alumno/${user.usuario_id}`, payload);
      alert("Perfil de alumno actualizado correctamente");
    } catch (err: any) {
      alert(err.message || "Error al actualizar el perfil");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <p className="animate-pulse text-zinc-500">Cargando panel...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm">
          Reintentar
        </button>
      </div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6">
          <div className="mb-8 px-4">
             <h2 className="text-xl font-bold">{JSON.parse(localStorage.getItem('user') || '{}').nombre} {JSON.parse(localStorage.getItem('user') || '{}').apellido}</h2>
             <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{JSON.parse(localStorage.getItem('user') || '{}').email}</p>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("reservations")}
              className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reservations' ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
            >
              Mis Reservas
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
            >
              Mi Perfil
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
          {/* --- RESERVATIONS TAB --- */}
          {activeTab === "reservations" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Mis Próximas Clases</h1>
                <Link
                  href="/professors"
                  className="bg-lime-500 hover:bg-lime-600 text-white dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Buscar más clases
                </Link>
              </div>

              <div className="space-y-4">
                {reservations.map((res) => {
                  const fecha = new Date(res.fecha_hora);
                  return (
                    <div key={res.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="mb-4 sm:mb-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-bold">
                            {fecha.toLocaleDateString("es-ES")} - {fecha.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          <b>Profesor:</b> {res.profesor.usuario.nombre} {res.profesor.usuario.apellido}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                          {res.duracion_minutos} min • Nivel {res.nivel}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleCancelReservation(res.id)}
                          className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 transition"
                        >
                          Cancelar Reserva
                        </button>
                      </div>
                    </div>
                  );
                })}

                {reservations.length === 0 && (
                  <div className="text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-200 rounded-xl">
                    Aún no tienes ninguna clase reservada.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- PROFILE TAB --- */}
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold mb-8">Editar Perfil de Alumno</h1>
              <form onSubmit={handleProfileUpdate} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800">
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
                    <input
                      type="date"
                      value={profile.fecha_nacimiento}
                      onChange={(e) => setProfile({ ...profile, fecha_nacimiento: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Edad</label>
                    <div className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
                      {calculateAge(profile.fecha_nacimiento)} años
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nivel</label>
                    <select
                      value={profile.nivel}
                      onChange={(e) => setProfile({ ...profile, nivel: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                    >
                      <option value="basico">Básico</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Posición</label>
                    <select
                      value={profile.posicion}
                      onChange={(e) => setProfile({ ...profile, posicion: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                    >
                      <option value="DRIVE">Drive</option>
                      <option value="REVES">Revés</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Género</label>
                    <select
                      value={profile.genero}
                      onChange={(e) => setProfile({ ...profile, genero: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                    >
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mano Dominante</label>
                    <select
                      value={profile.mano_dominante}
                      onChange={(e) => setProfile({ ...profile, mano_dominante: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                    >
                      <option value="diestro">Diestro</option>
                      <option value="zurdo">Zurdo</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button type="submit" className="bg-zinc-900 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500 transition">
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
