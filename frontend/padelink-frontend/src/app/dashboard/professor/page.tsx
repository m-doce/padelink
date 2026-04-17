"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import { parse, format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("es", es);

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
  descripcion?: string;
  club?: {
    club_id: number;
    nombre: string;
    ubicacion: string;
  };
  profesor?: {
    usuario_id: number;
    usuario: Usuario;
  };
};

type FilterState = {
  fecha: string;
  estado: string;
};

type Club = {
  club_id: number;
  nombre: string;
  ubicacion: string;
};

export default function ProfessorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"classes" | "history" | "profile">("classes");
  const [profile, setProfile] = useState<ProfesorProfile | null>(null);
  const [classes, setClasses] = useState<Clase[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros para historial
  const [filters, setFilters] = useState<FilterState>({
    fecha: "",
    estado: "",
  });

  // Modal de agregar/editar clase
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Clase | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);
  
  // Estados para el selector de Club buscador
  const [clubSearch, setClubSearch] = useState("");
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [isCreatingClub, setIsCreatingClub] = useState(false);
  const [newClubName, setNewClubName] = useState("");

  const [newClass, setNewClass] = useState({
    duracion_minutos: 60,
    nivel: "",
    clubId: null as number | null,
    capacidad_maxima: 4,
    descripcion: "",
  });

  // Alumnos únicos del profesor (panel lateral)
  const [alumnos, setAlumnos] = useState<any[]>([]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowClubDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push("/login");
        return;
      }
      const user = JSON.parse(userStr);

      try {
        const [profData, classesData, clubsData] = await Promise.all([
          api.get<ProfesorProfile>(`/profesor/${user.usuario_id}`),
          api.get<Clase[]>(`/clase/profesor/${user.usuario_id}`),
          api.get<Club[]>("/club")
        ]);
        setProfile(profData);
         setClasses(classesData);
         setClubs(clubsData);
        
        // Extraer alumnos únicos de todas las clases
        const uniqueAlumnos = new Map<string, any>();
        classesData.forEach((cls: Clase) => {
          cls.alumnos_inscritos?.forEach((alumno: any) => {
            if (!uniqueAlumnos.has(alumno.usuario_id)) {
              uniqueAlumnos.set(alumno.usuario_id, alumno);
            }
          });
        });
        setAlumnos(Array.from(uniqueAlumnos.values()));
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
      const payload = {
        ...profile,
        nombre: profile.usuario.nombre,
        apellido: profile.usuario.apellido,
        email: profile.usuario.email,
        telefono: profile.usuario.telefono
      };
      
      const updatedProfile = await api.patch<ProfesorProfile>(`/profesor/${user.usuario_id}`, payload);
      setProfile(updatedProfile);
      
      const newUser = { ...user, ...updatedProfile.usuario };
      localStorage.setItem('user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('auth-change'));
      
      toast.success("¡Perfil actualizado!", {
        description: "Los cambios se guardaron correctamente.",
      });
    } catch (err: any) {
      toast.error("Error al actualizar", {
        description: err.message || "No se pudieron guardar los cambios.",
      });
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    
    toast.promise(
      api.delete(`/clase/${classToDelete}`).then(() => {
        setClasses(classes.filter((c) => c.id !== classToDelete));
        setClassToDelete(null);
      }),
      {
        loading: "Eliminando clase...",
        success: "Clase eliminada correctamente.",
        error: "No se pudo eliminar la clase.",
      }
    );
  };

  const openEditModal = (cls: Clase) => {
    setEditingClass(cls);
    const date = new Date(cls.fecha_hora);
    setSelectedDate(date);
    setNewClass({
      duracion_minutos: cls.duracion_minutos,
      nivel: cls.nivel,
      clubId: cls.club?.club_id || null,
      capacidad_maxima: cls.capacidad_maxima,
      descripcion: cls.descripcion || "",
    });
    setClubSearch(cls.club?.nombre || "");
    setShowClassModal(true);
  };

  const closeModal = () => {
    setShowClassModal(false);
    setEditingClass(null);
    setSelectedDate(null);
    setClubSearch("");
    setShowClubDropdown(false);
    setIsCreatingClub(false);
    setNewClass({
      duracion_minutos: 60,
      nivel: "",
      clubId: null,
      capacidad_maxima: 4,
      descripcion: "",
    });
  };

  const handleCreateClub = async () => {
    if (!clubSearch.trim()) return;
    try {
      const newClub = await api.post<Club>("/club", { 
        nombre: clubSearch,
        ubicacion: "A definir" 
      });
      setClubs([...clubs, newClub]);
      setNewClass({ ...newClass, clubId: newClub.club_id });
      setClubSearch(newClub.nombre);
      setShowClubDropdown(false);
      toast.success(`Club "${newClub.nombre}" creado y seleccionado`);
    } catch (err: any) {
      toast.error("Error al crear el club", { description: err.message });
    }
  };

  // Filtrado de clubes para el buscador
  const filteredClubs = clubs.filter(club => 
    club.nombre.toLowerCase().includes(clubSearch.toLowerCase())
  );

  // Verificar si existe la opción "A domicilio"
  const hasDomicilio = clubs.some(c => c.nombre.toLowerCase() === "a domicilio");

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr!);

    try {
      if (!selectedDate) {
        toast.error("Error", { description: "Debes seleccionar fecha y hora." });
        return;
      }

      if (!newClass.clubId) {
        toast.error("Error", { description: "Debes seleccionar un club." });
        return;
      }

      const fecha_hora = selectedDate.toISOString();
      const payload: any = {
        fecha_hora,
        duracion_minutos: newClass.duracion_minutos,
        nivel: newClass.nivel || null,
        capacidad_maxima: newClass.capacidad_maxima,
        descripcion: newClass.descripcion || null,
        tipo_clase: "GRUPAL",
      };

      if (editingClass) {
        payload.estado = editingClass.estado;
        const updated = await api.patch<Clase>(`/clase/${editingClass.id}`, payload);
        setClasses(classes.map(c => c.id === editingClass.id ? updated : c));
        toast.success("¡Clase actualizada!");
      } else {
        payload.profesorId = user.usuario_id;
        payload.clubId = newClass.clubId;
        const createdClass = await api.post<Clase>("/clase", payload);
        setClasses([...classes, createdClass]);
        toast.success("¡Clase creada!");
      }
      
      closeModal();
    } catch (err: any) {
      toast.error("Error", {
        description: err.message || "No se pudo guardar la clase.",
      });
    }
  };

  // Filtrado de clases para historial
  const filteredClasses = classes.filter((cls) => {
    if (filters.fecha) {
      const classDate = new Date(cls.fecha_hora).toISOString().split('T')[0];
      if (classDate !== filters.fecha) return false;
    }
    if (filters.estado && cls.estado !== filters.estado) return false;
    return true;
  });

  // Clases próximas (para "Mis Clases")
  const upcomingClasses = classes.filter(c => new Date(c.fecha_hora) >= new Date());
  const pastClasses = classes.filter(c => new Date(c.fecha_hora) < new Date());

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-lime-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Cargando dashboard...</p>
        </div>
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
        <aside className="w-full md:w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6">
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab("classes")}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'classes' ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
            >
              📅 Mis Clases
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
            >
              📊 Historial
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
            >
              👤 Mi Perfil
            </button>
          </nav>

          {/* Panel de Alumnos */}
          {alumnos.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Mis Alumnos ({alumnos.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alumnos.map((alumno) => (
                  <div key={alumno.usuario_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center text-lime-700 dark:text-lime-400 font-medium text-sm">
                      {alumno.usuario?.nombre?.[0]}{alumno.usuario?.apellido?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {alumno.usuario?.nombre} {alumno.usuario?.apellido}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{alumno.usuario?.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          
          {/* --- CLASSES TAB --- */}
          {activeTab === "classes" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Mis Clases</h1>
                <button 
                  onClick={() => setShowClassModal(true)}
                  className="bg-lime-500 hover:bg-lime-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-lime-500/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Clase
                </button>
              </div>

              <div className="space-y-4">
                 {upcomingClasses.length === 0 ? (
                   <div className="text-center py-16 text-zinc-500 border-2 border-dashed border-zinc-200 rounded-xl">
                     <div className="text-4xl mb-3">📅</div>
                     <p>No tenés clases próximas.</p>
                     <p className="text-sm mt-1">Creá una nueva clase para empezar.</p>
                   </div>
                 ) : (
                   upcomingClasses.map((cls) => (
                     <ClassCard 
                       key={cls.id} 
                       clase={cls} 
                       onEdit={() => openEditModal(cls)}
                       onDelete={() => {
                         setClassToDelete(cls.id);
                         setShowDeleteModal(true);
                       }}
                     />
                   ))
                 )}
              </div>
            </div>
          )}

          {/* --- HISTORY TAB --- */}
          {activeTab === "history" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Historial de Clases</h1>
              </div>

              {/* Filtros */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 mb-6 border border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Fecha</label>
                  <input 
                    type="date" 
                    value={filters.fecha}
                    onChange={(e) => setFilters({...filters, fecha: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Estado</label>
                  <select 
                    value={filters.estado}
                    onChange={(e) => setFilters({...filters, estado: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950"
                  >
                    <option value="">Todos</option>
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="COMPLETA">Completa</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
                {(filters.fecha || filters.estado) && (
                  <div className="flex items-end">
                    <button 
                      onClick={() => setFilters({fecha: "", estado: ""})}
                      className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {filteredClasses.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    <p>No hay clases que coincidan con los filtros.</p>
                  </div>
                ) : (
                  filteredClasses.map((cls) => (
                    <HistoryCard key={cls.id} clase={cls} />
                  ))
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
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 outline-none dark:bg-zinc-950"
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
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 outline-none dark:bg-zinc-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Biografía</label>
                  <textarea 
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 outline-none dark:bg-zinc-950"
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
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 outline-none dark:bg-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mano Dominante</label>
                    <select 
                      value={profile.manoDominante}
                      onChange={(e) => setProfile({...profile, manoDominante: e.target.value})}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 outline-none dark:bg-zinc-950"
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
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 outline-none dark:bg-zinc-950"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                   <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-lime-500/20">
                     Guardar Cambios
                   </button>
                </div>

              </form>
            </div>
          )}

        </main>
      </div>

      {/* --- CLASS MODAL --- */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingClass ? "Editar Clase" : "Nueva Clase"}
                </h2>
                <button onClick={closeModal} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSaveClass} className="space-y-4">

                 {/* Fecha y Hora con DatePicker */}
                 <div className="space-y-1.5">
                   <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Fecha y Hora</label>
                   <div className="relative datepicker-container">
                     <DatePicker
                       selected={selectedDate}
                       onChange={(date) => setSelectedDate(date)}
                       showTimeSelect
                       timeFormat="HH:mm"
                       timeIntervals={15}
                       timeCaption="Hora"
                       dateFormat="dd/MM/yyyy HH:mm"
                       locale="es"
                       minDate={new Date()}
                       placeholderText="Selecciona fecha y hora"
                       className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 text-sm dark:bg-zinc-950 focus:ring-2 focus:ring-lime-500 outline-none transition-all pr-10"
                       wrapperClassName="w-full"
                     />
                     <svg className="absolute right-3 top-3.5 w-5 h-5 text-zinc-400 pointer-events-none z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                   </div>
                 </div>

                 {/* Club Searcher */}
                 <div className="space-y-1.5 relative">
                   <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Club *</label>
                   <div className="relative">
                     <input 
                       type="text" 
                       placeholder="Escribe para buscar o agregar club..."
                       className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 text-sm dark:bg-zinc-950 focus:ring-2 focus:ring-lime-500 outline-none transition-all pr-10"
                       value={clubSearch}
                       onFocus={() => setShowClubDropdown(true)}
                       onChange={e => {
                         setClubSearch(e.target.value);
                         setShowClubDropdown(true);
                         if (newClass.clubId) setNewClass({...newClass, clubId: null});
                       }}
                     />
                     <div className="absolute right-3 top-3.5 flex items-center gap-2">
                       {newClass.clubId && (
                         <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                         </svg>
                       )}
                       <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                       </svg>
                     </div>
                   </div>

                   {showClubDropdown && (
                     <div className="absolute z-[60] mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden">
                       {/* Opción A domicilio si no está en la búsqueda pero coincide */}
                       {!hasDomicilio && "a domicilio".includes(clubSearch.toLowerCase()) && clubSearch.length > 0 && (
                         <button
                           type="button"
                           onClick={async () => {
                             try {
                               const res = await api.post<Club>("/club", { nombre: "A domicilio", ubicacion: "Dirección del alumno" });
                               setClubs([...clubs, res]);
                               setNewClass({ ...newClass, clubId: res.club_id });
                               setClubSearch(res.nombre);
                               setShowClubDropdown(false);
                             } catch (e) {}
                           }}
                           className="w-full text-left px-4 py-3 text-sm hover:bg-lime-50 dark:hover:bg-lime-900/20 text-lime-600 font-medium border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2"
                         >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                           </svg>
                           Seleccionar "A domicilio"
                         </button>
                       )}

                       {filteredClubs.map(club => (
                         <button
                           key={club.club_id}
                           type="button"
                           onClick={() => {
                             setNewClass({ ...newClass, clubId: club.club_id });
                             setClubSearch(club.nombre);
                             setShowClubDropdown(false);
                           }}
                           className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                         >
                           <div className="font-medium text-zinc-900 dark:text-zinc-100">{club.nombre}</div>
                           <div className="text-xs text-zinc-500">{club.ubicacion}</div>
                         </button>
                       ))}

                       {filteredClubs.length === 0 && clubSearch.length > 0 && (
                         <button
                           type="button"
                           onClick={handleCreateClub}
                           className="w-full text-left px-4 py-4 text-sm hover:bg-lime-50 dark:hover:bg-lime-900/20 text-lime-600 font-bold flex items-center gap-2"
                         >
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           Agregar "{clubSearch}" como nuevo club
                         </button>
                       )}
                       
                       {filteredClubs.length === 0 && clubSearch.length === 0 && (
                         <div className="px-4 py-8 text-center text-zinc-400 text-sm">
                           Escribe para buscar un club...
                         </div>
                       )}
                     </div>
                   )}
                 </div>

                 {/* Duración y Nivel */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Duración</label>
                      <select 
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 p-2.5 text-sm dark:bg-zinc-950 focus:ring-2 focus:ring-lime-500 outline-none"
                        value={newClass.duracion_minutos} 
                        onChange={e => setNewClass({...newClass, duracion_minutos: Number(e.target.value)})}
                      >
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                        <option value={90}>90 min</option>
                        <option value={120}>120 min</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Nivel</label>
                      <select 
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 p-2.5 text-sm dark:bg-zinc-950 focus:ring-2 focus:ring-lime-500 outline-none"
                        value={newClass.nivel} 
                        onChange={e => setNewClass({...newClass, nivel: e.target.value})}
                      >
                        <option value="">Sin asignar</option>
                        <option value="basico">Básico</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>
                 </div>

                 {/* Cupos */}
                 <div>
                    <label className="block text-xs font-medium mb-1">Cupos disponibles</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={20}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 p-2.5 text-sm dark:bg-zinc-950 focus:ring-2 focus:ring-lime-500 outline-none" 
                      value={newClass.capacidad_maxima} 
                      onChange={e => setNewClass({...newClass, capacidad_maxima: Math.max(1, Math.min(20, Number(e.target.value)))})}
                    />
                 </div>

                 {/* Estado (solo al editar) */}
                 {editingClass && (
                   <div>
                      <label className="block text-xs font-medium mb-1">Estado</label>
                      <select 
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 p-2.5 text-sm dark:bg-zinc-950 focus:ring-2 focus:ring-lime-500 outline-none"
                        value={editingClass.estado}
                        onChange={(e) => setEditingClass({...editingClass, estado: e.target.value})}
                      >
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="COMPLETA">Completa</option>
                        <option value="CANCELADA">Cancelada</option>
                      </select>
                   </div>
                 )}

                 {/* Descripción */}
                 <div>
                    <label className="block text-xs font-medium mb-1">Descripción (opcional)</label>
                    <textarea className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 p-2.5 text-sm dark:bg-zinc-950 focus:ring-2 focus:ring-lime-500 outline-none" rows={2}
                      value={newClass.descripcion} onChange={e => setNewClass({...newClass, descripcion: e.target.value})}
                      placeholder="Ej: Clase enfocada en mejora de drive..."
                    ></textarea>
                 </div>

                 {/* Botones */}
                 <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg dark:text-zinc-400 dark:hover:bg-zinc-800 transition">Cancelar</button>
                    <button type="submit" className="px-5 py-2.5 text-sm bg-lime-500 text-white hover:bg-lime-600 rounded-lg font-medium shadow-lg shadow-lime-500/20 transition">
                      {editingClass ? "Guardar Cambios" : "Crear Clase"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteClass}
        title="¿Eliminar clase?"
        description="Esta acción no se puede deshacer. Los alumnos inscritos serán notificados (si aplica)."
        confirmLabel="Eliminar Clase"
        cancelLabel="Volver"
        variant="danger"
      />

    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function ClassCard({ clase, onEdit, onDelete }: { clase: Clase; onEdit: () => void; onDelete: () => void }) {
  const fecha = new Date(clase.fecha_hora);
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 sm:mb-0 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
            clase.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            clase.estado === 'COMPLETA' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {clase.estado}
          </span>
          {clase.club && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {clase.club.nombre}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold">
          {fecha.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })} - {fecha.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
        </h3>
        <p className="text-sm text-zinc-500 mt-1">
          {clase.nivel ? `Nivel ${clase.nivel}` : "Sin nivel asignado"} • {clase.duracion_minutos} min • {clase.alumnos_inscritos?.length || 0}/{clase.capacidad_maxima} alumnos
        </p>
        {clase.descripcion && (
          <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{clase.descripcion}</p>
        )}
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button 
          onClick={onEdit}
          className="flex-1 sm:flex-none px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </button>
        <button 
          onClick={onDelete}
          className="flex-1 sm:flex-none px-4 py-2 text-sm border border-red-200 dark:border-red-900/50 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>
    </div>
  );
}

function HistoryCard({ clase }: { clase: Clase }) {
  const fecha = new Date(clase.fecha_hora);
  
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-zinc-400 dark:text-zinc-600">
            {fecha.toLocaleDateString("es-ES", { day: 'numeric' })}
          </div>
          <div className="text-xs text-zinc-400 uppercase">
            {fecha.toLocaleDateString("es-ES", { month: 'short' })}
          </div>
        </div>
        <div>
          <p className="font-medium">
            {fecha.toLocaleDateString("es-ES", { weekday: 'long' })} - {fecha.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-zinc-500">
            {clase.alumnos_inscritos?.length || 0} alumnos • {clase.nivel || "Sin nivel"}
          </p>
        </div>
      </div>
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
        clase.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
        clase.estado === 'COMPLETA' ? 'bg-blue-100 text-blue-700' :
        'bg-red-100 text-red-700'
      }`}>
        {clase.estado}
      </span>
    </div>
  );
}
