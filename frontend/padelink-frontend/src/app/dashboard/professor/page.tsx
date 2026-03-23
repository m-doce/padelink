"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// --- TYPES ---
type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
};

type ProfesorProfile = {
  bio: string;
  precioPorClase: number;
  manoDominante: string;
  linkAjpp: string;
  usuario: Usuario;
};

type Clase = {
  id: number;
  fecha_hora: string;
  duracion_minutos: number;
  nivel: string;
  capacidad_maxima: number;
  alumnos_inscritos: any[];
  estado: string;
};

export default function ProfessorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "classes">("classes");
  
  // Profile State
  const [profile, setProfile] = useState<ProfesorProfile | null>(null);
  const [classes, setClasses] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Classes State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  
  // New Class Form State
  const [newClass, setNewClass] = useState({
    fecha: "",
    hora: "",
    duracion_minutos: 60,
    nivel: "basico",
    capacidad_maxima: 4,
    descripcion: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push("/login");
        return;
      }
      const user = JSON.parse(userStr);

      try {
        const [profData, classesData] = await Promise.all([
          api.get<ProfesorProfile>(`/profesor/${user.usuario_id}`),
          api.get<Clase[]>(`/clase/profesor/${user.usuario_id}`)
        ]);
        setProfile(profData);
        setClasses(classesData);
      } catch (err: any) {
        console.error("Error loading dashboard", err);
        setError(err.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // --- HANDLERS ---

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr!);

    try {
      // Preparamos el payload con los datos de usuario a primer nivel para que el backend los procese
      const payload = {
        ...profile,
        nombre: profile.usuario.nombre,
        apellido: profile.usuario.apellido,
        email: profile.usuario.email,
        telefono: profile.usuario.telefono
      };
      
      const updatedProfile = await api.patch<ProfesorProfile>(`/profesor/${user.usuario_id}`, payload);
      setProfile(updatedProfile);
      
      // Actualizar localStorage con los datos nuevos
      const newUser = { ...user, ...updatedProfile.usuario };
      localStorage.setItem('user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('auth-change'));
      
      alert("Perfil actualizado correctamente");
    } catch (err: any) {
      alert(err.message || "Error al actualizar perfil");
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta clase?")) {
      try {
        await api.delete(`/clase/${id}`);
        setClasses(classes.filter((c) => c.id !== id));
      } catch (err) {
        alert("No se pudo eliminar la clase");
      }
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr!);

    try {
      const fecha_hora = new Date(`${newClass.fecha}T${newClass.hora}`).toISOString();
      const payload = {
        ...newClass,
        fecha_hora,
        profesorId: user.usuario_id,
        nivel: String(newClass.nivel),
        tipo_clase: "GRUPAL",
        estado: "DISPONIBLE"
      };

      const createdClass = await api.post<Clase>("/clase", payload);
      setClasses([...classes, createdClass]);
      setShowAddClassModal(false);
      setNewClass({
        fecha: "",
        hora: "",
        duracion_minutos: 60,
        nivel: "basico",
        capacidad_maxima: 4,
        descripcion: "",
      });
    } catch (err: any) {
      alert(err.message || "Error al crear clase");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <p className="animate-pulse text-zinc-500">Cargando dashboard...</p>
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
           <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab("classes")}
                className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'classes' ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
              >
                Mis Clases
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
          
          {/* --- CLASSES TAB --- */}
          {activeTab === "classes" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Gestionar Clases</h1>
                <button 
                  onClick={() => setShowAddClassModal(true)}
                  className="bg-lime-500 hover:bg-lime-600 text-white dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  + Nueva Clase
                </button>
              </div>

              <div className="space-y-4">
                 {classes.map((cls) => {
                   const fecha = new Date(cls.fecha_hora);
                   return (
                     <div key={cls.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="mb-4 sm:mb-0">
                           <div className="flex items-center gap-3 mb-1">
                              <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${cls.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                                {cls.estado}
                              </span>
                              <span className="text-lg font-bold">
                                {fecha.toLocaleDateString("es-ES")} - {fecha.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                           <p className="text-sm text-zinc-500 dark:text-zinc-400">Nivel {cls.nivel} • {cls.duracion_minutos} min</p>
                           <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Inscritos: <b>{cls.alumnos_inscritos?.length || 0}</b> / {cls.capacidad_maxima}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button className="flex-1 sm:flex-none px-3 py-1.5 border border-zinc-300 rounded text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition">
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteClass(cls.id)}
                            className="flex-1 sm:flex-none px-3 py-1.5 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 transition"
                          >
                            Eliminar
                          </button>
                        </div>
                     </div>
                   );
                 })}
                 
                 {classes.length === 0 && (
                   <div className="text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-200 rounded-xl">
                     No tienes clases creadas.
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* --- PROFILE TAB --- */}
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold mb-8">Editar Perfil</h1>
              <form onSubmit={handleProfileUpdate} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800">
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input 
                      type="text" 
                      value={profile.usuario?.nombre || ""}
                      onChange={(e) => setProfile({
                        ...profile, 
                        usuario: { ...profile.usuario, nombre: e.target.value }
                      })}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Apellido</label>
                    <input 
                      type="text" 
                      value={profile.usuario?.apellido || ""}
                      onChange={(e) => setProfile({
                        ...profile, 
                        usuario: { ...profile.usuario, apellido: e.target.value }
                      })}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Biografía</label>
                  <textarea 
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                    rows={4}
                  />
                  <p className="text-xs text-zinc-500 mt-1">Describe tu experiencia y metodología.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Precio por Clase ($)</label>
                    <input 
                      type="number" 
                      value={profile.precioPorClase}
                      onChange={(e) => setProfile({...profile, precioPorClase: Number(e.target.value)})}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mano Dominante</label>
                    <select 
                      value={profile.manoDominante}
                      onChange={(e) => setProfile({...profile, manoDominante: e.target.value})}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                    >
                      <option value="diestro">Diestro</option>
                      <option value="zurdo">Zurdo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Link AJPP (Opcional)</label>
                  <input 
                    type="url" 
                    value={profile.linkAjpp}
                    onChange={(e) => setProfile({...profile, linkAjpp: e.target.value})}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none dark:bg-zinc-950 dark:border-zinc-700"
                  />
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

      {/* --- ADD CLASS MODAL --- */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-xl shadow-xl p-6 animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold mb-4">Nueva Clase</h2>
              <form onSubmit={handleAddClass} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Fecha</label>
                      <input required type="date" className="w-full rounded border p-2 text-sm dark:bg-zinc-950 dark:border-zinc-700" 
                        value={newClass.fecha} onChange={e => setNewClass({...newClass, fecha: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Hora</label>
                      <input required type="time" className="w-full rounded border p-2 text-sm dark:bg-zinc-950 dark:border-zinc-700" 
                        value={newClass.hora} onChange={e => setNewClass({...newClass, hora: e.target.value})}
                      />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Duración (min)</label>
                      <input type="number" className="w-full rounded border p-2 text-sm dark:bg-zinc-950 dark:border-zinc-700" 
                        value={newClass.duracion_minutos} onChange={e => setNewClass({...newClass, duracion_minutos: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Nivel</label>
                      <select 
                        className="w-full rounded border p-2 text-sm dark:bg-zinc-950 dark:border-zinc-700"
                        value={newClass.nivel} 
                        onChange={e => setNewClass({...newClass, nivel: e.target.value})}
                      >
                        <option value="basico">Básico</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Capacidad</label>
                      <input type="number" className="w-full rounded border p-2 text-sm dark:bg-zinc-950 dark:border-zinc-700" 
                        value={newClass.capacidad_maxima} onChange={e => setNewClass({...newClass, capacidad_maxima: Number(e.target.value)})}
                      />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-medium mb-1">Descripción</label>
                    <textarea className="w-full rounded border p-2 text-sm dark:bg-zinc-950 dark:border-zinc-700" rows={2}
                      value={newClass.descripcion} onChange={e => setNewClass({...newClass, descripcion: e.target.value})}
                    ></textarea>
                 </div>

                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowAddClassModal(false)} className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded dark:text-zinc-400 dark:hover:bg-zinc-800">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-lime-500 text-white hover:bg-lime-600 rounded font-medium dark:bg-lime-400 dark:text-zinc-900">Crear Clase</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
