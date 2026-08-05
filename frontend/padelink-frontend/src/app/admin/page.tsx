"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoUsuario: "ALUMNO" | "PROFESOR" | "ADMIN";
  activo: boolean;
  fecha_registro: string;
};

type Clase = {
  id: number;
  fecha_hora: string;
  estado: string;
  club?: { nombre: string };
  profesor?: { usuario?: { nombre: string; apellido: string } };
  alumnos_inscritos?: unknown[];
};

type UserDetail = Usuario & { clases?: Clase[]; reservas?: Clase[] };

const roleLabels = { ALUMNO: "Alumno", PROFESOR: "Profesor", ADMIN: "Administrador" };

export default function AdminPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [form, setForm] = useState<Partial<Usuario>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [submittingLogin, setSubmittingLogin] = useState(false);

  const loadUsers = async () => {
    const data = await api.get<Usuario[]>("/admin");
    setUsers(data);
  };

  useEffect(() => {
    const load = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || JSON.parse(storedUser).tipoUsuario !== "ADMIN") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
        return;
      }
      try {
        await loadUsers();
        setIsAdmin(true);
      } catch (error: any) {
        toast.error("No se pudo abrir el panel", { description: error.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loginAsAdmin = async (event: FormEvent) => {
    event.preventDefault();
    setSubmittingLogin(true);
    try {
      const data: any = await api.post("/auth/login", loginForm);
      if (data.user.tipoUsuario !== "ADMIN") {
        throw new Error("Esta cuenta no tiene permisos de administrador");
      }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-change"));
      await loadUsers();
      setIsAdmin(true);
      setLoading(false);
      toast.success("Sesión de administrador iniciada");
    } catch (error: any) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("No se pudo iniciar sesión", { description: error.message || "Verificá tus credenciales" });
    } finally {
      setSubmittingLogin(false);
    }
  };

  const selectUser = async (id: number) => {
    try {
      const detail = await api.get<UserDetail>(`/admin/usuarios/${id}`);
      setSelected(detail);
      setForm({ nombre: detail.nombre, apellido: detail.apellido, email: detail.email, telefono: detail.telefono, activo: detail.activo });
    } catch (error: any) {
      toast.error("No se pudo cargar el usuario", { description: error.message });
    }
  };

  const saveUser = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    try {
      const updated = await api.patch<Usuario>(`/admin/usuarios/${selected.id}`, form);
      setUsers((current) => current.map((user) => user.id === updated.id ? updated : user));
      setSelected({ ...selected, ...updated });
      toast.success("Usuario actualizado correctamente");
    } catch (error: any) {
      toast.error("No se pudo guardar", { description: error.message });
    }
  };

  const deleteUser = async () => {
    if (!selected || !window.confirm(`¿Eliminar a ${selected.nombre} ${selected.apellido}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/admin/usuarios/${selected.id}`);
      setUsers((current) => current.filter((user) => user.id !== selected.id));
      setSelected(null);
      toast.success("Usuario eliminado correctamente");
    } catch (error: any) {
      toast.error("No se pudo eliminar", { description: error.message });
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.nombre} ${user.apellido} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const relatedClasses = selected?.tipoUsuario === "PROFESOR" ? selected.clases : selected?.reservas;

  if (loading) return <div className="min-h-screen grid place-items-center bg-zinc-50 text-zinc-500">Cargando panel de administración…</div>;

  if (!isAdmin) return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-zinc-50 via-lime-50 to-zinc-100 p-4 dark:from-zinc-950 dark:via-lime-950/20 dark:to-zinc-950">
      <form onSubmit={loginAsAdmin} className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-7"><p className="text-sm font-medium text-lime-600">PadeLink</p><h1 className="mt-1 text-2xl font-bold">Acceso de administrador</h1><p className="mt-2 text-sm text-zinc-500">Ingresá con una cuenta autorizada para administrar la plataforma.</p></div>
        <div className="space-y-4"><label className="block text-sm font-medium">Correo electrónico<input required type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 outline-none focus:ring-2 focus:ring-lime-500 dark:border-zinc-700" /></label><label className="block text-sm font-medium">Contraseña<input required type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 outline-none focus:ring-2 focus:ring-lime-500 dark:border-zinc-700" /></label><button disabled={submittingLogin} className="w-full rounded-lg bg-lime-500 px-4 py-2.5 font-medium text-white hover:bg-lime-600 disabled:opacity-50">{submittingLogin ? "Ingresando…" : "Ingresar al panel"}</button></div>
      </form>
    </main>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-5 md:p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-lime-600 dark:text-lime-400">Administración</p>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de usuarios</h1>
          <p className="mt-2 text-zinc-500">Consultá, modificá y eliminá cuentas, clases y reservas desde un único lugar.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <section className="rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o correo…" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lime-500" />
            </div>
            <div className="max-h-[580px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredUsers.map((user) => (
                <button key={user.id} onClick={() => selectUser(user.id)} className={`w-full text-left p-4 transition hover:bg-lime-50 dark:hover:bg-lime-950/30 ${selected?.id === user.id ? "bg-lime-50 dark:bg-lime-950/30" : ""}`}>
                  <div className="flex items-center justify-between gap-2"><span className="font-medium">{user.nombre} {user.apellido}</span><span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs">{roleLabels[user.tipoUsuario]}</span></div>
                  <p className="mt-1 text-sm text-zinc-500 truncate">{user.email}</p>
                  {!user.activo && <p className="mt-1 text-xs text-red-600">Cuenta inactiva</p>}
                </button>
              ))}
              {filteredUsers.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No hay usuarios para mostrar.</p>}
            </div>
          </section>
          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800">
            {!selected ? <div className="grid min-h-72 place-items-center text-center text-zinc-500"><p>Seleccioná un usuario para ver sus datos y actividad.</p></div> : <>
              <div className="flex items-start justify-between gap-4 mb-6"><div><h2 className="text-xl font-semibold">{selected.nombre} {selected.apellido}</h2><p className="text-sm text-zinc-500">{roleLabels[selected.tipoUsuario]} · ID {selected.id}</p></div><button onClick={deleteUser} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900">Eliminar</button></div>
              <form onSubmit={saveUser} className="grid gap-4 sm:grid-cols-2">
                {([['nombre', 'Nombre'], ['apellido', 'Apellido'], ['email', 'Correo electrónico'], ['telefono', 'Teléfono']] as const).map(([field, label]) => <label key={field} className="text-sm font-medium">{label}<input type={field === 'email' ? 'email' : 'text'} value={(form[field] as string) ?? ''} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-1.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-lime-500" /></label>)}
                <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2"><input type="checkbox" checked={Boolean(form.activo)} onChange={(event) => setForm({ ...form, activo: event.target.checked })} className="accent-lime-500" /> Cuenta activa</label>
                <div className="sm:col-span-2 flex justify-end"><button className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-white hover:bg-lime-600">Guardar cambios</button></div>
              </form>
              {selected.tipoUsuario !== "ADMIN" && <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800"><h3 className="font-semibold">{selected.tipoUsuario === "PROFESOR" ? "Clases publicadas" : "Reservas"}</h3><div className="mt-3 space-y-2">{relatedClasses?.map((clase) => <div key={clase.id} className="rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800/60"><p className="font-medium">{new Date(clase.fecha_hora).toLocaleString("es-AR")}</p><p className="mt-1 text-zinc-500">{clase.club?.nombre || "Sin club"} · {clase.estado}{selected.tipoUsuario === "PROFESOR" ? ` · ${clase.alumnos_inscritos?.length || 0} inscriptos` : clase.profesor?.usuario ? ` · Prof. ${clase.profesor.usuario.nombre} ${clase.profesor.usuario.apellido}` : ""}</p></div>)}{!relatedClasses?.length && <p className="text-sm text-zinc-500">No hay registros asociados.</p>}</div></div>}
            </>}
          </section>
        </div>
      </main>
    </div>
  );
}
