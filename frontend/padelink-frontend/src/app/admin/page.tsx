"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import GestionUsuarios from "@/components/admin/GestionUsuarios";
import GestionClases from "@/components/admin/GestionClases";
import { BOTON, EncabezadoPanel, GrillaDatos, Pestanas, TarjetaDato } from "@/components/panel/ElementosPanel";
import { Campo, Entrada } from "@/components/ui/Formulario";
import { CargandoTarjetas, MensajeError } from "@/components/ui/EstadosListado";
import { useAuth } from "@/context/AuthContext";
import { useApiGet } from "@/hooks/useApiGet";
import { api } from "@/lib/api";
import { resumenAdmin } from "@/lib/paneles";
import type { ClaseListado, LoginResponse, UsuarioAdmin } from "@/types";

type PestanaAdmin = "usuarios" | "clases";

export default function AdminPage() {
  const { user } = useAuth();
  return user?.tipoUsuario === "ADMIN" ? <PanelAdmin idAdmin={user.usuario_id} nombre={user.nombre} /> : <AccesoAdmin />;
}

function PanelAdmin({ idAdmin, nombre }: { idAdmin: number; nombre: string }) {
  const usuariosApi = useApiGet<UsuarioAdmin[]>("/admin");
  const clasesApi = useApiGet<ClaseListado[]>("/clase");
  const [pestana, setPestana] = useState<PestanaAdmin>("usuarios");

  // Cambios hechos en esta pantalla, aplicados sobre lo que vino del servidor
  const [usuariosLocales, setUsuariosLocales] = useState<UsuarioAdmin[] | null>(null);
  const [clasesLocales, setClasesLocales] = useState<ClaseListado[] | null>(null);
  const usuarios = useMemo(() => usuariosLocales ?? usuariosApi.data ?? [], [usuariosLocales, usuariosApi.data]);
  const clases = useMemo(() => clasesLocales ?? clasesApi.data ?? [], [clasesLocales, clasesApi.data]);
  const resumen = useMemo(() => resumenAdmin(usuarios, clases), [usuarios, clases]);

  const cargando = usuariosApi.loading || clasesApi.loading;
  const error = usuariosApi.error || clasesApi.error;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-12">
        <EncabezadoPanel saludo="Panel de administración" subtitulo={`Hola, ${nombre}. Gestioná usuarios y clases de PadeLink desde acá.`} />

        {cargando ? (
          <CargandoTarjetas cantidad={4} />
        ) : error ? (
          <MensajeError
            mensaje={error}
            onReintentar={() => {
              usuariosApi.recargar();
              clasesApi.recargar();
            }}
          />
        ) : (
          <>
            <GrillaDatos>
              <TarjetaDato etiqueta="Alumnos" valor={resumen.alumnos} detalle={resumen.inactivos ? `${resumen.inactivos} cuentas inactivas en total` : "todas las cuentas activas"} />
              <TarjetaDato etiqueta="Profesores" valor={resumen.profesores} tono="lima" />
              <TarjetaDato etiqueta="Clases próximas" valor={resumen.clasesProximas} detalle={`${resumen.clasesCompletas} completas · ${resumen.clasesCanceladas} canceladas`} tono="azul" />
              <TarjetaDato etiqueta="Reservas activas" valor={resumen.reservasActivas} detalle="en clases próximas" />
            </GrillaDatos>

            <Pestanas
              activa={pestana}
              onCambiar={setPestana}
              pestanas={[
                { id: "usuarios", etiqueta: "Usuarios", cantidad: usuarios.length },
                { id: "clases", etiqueta: "Clases", cantidad: clases.length },
              ]}
            />

            {pestana === "usuarios" && (
              <GestionUsuarios
                usuarios={usuarios}
                idAdminActual={idAdmin}
                onActualizado={(u) => setUsuariosLocales(usuarios.map((x) => (x.id === u.id ? { ...x, ...u } : x)))}
                onEliminado={(id) => {
                  setUsuariosLocales(usuarios.filter((x) => x.id !== id));
                  // Al borrar un profesor se borran sus clases: se vuelven a pedir para reflejarlo
                  clasesApi.recargar({ silencioso: true }).then(() => setClasesLocales(null));
                }}
              />
            )}

            {pestana === "clases" && (
              <GestionClases
                clases={clases}
                onActualizada={(c) => setClasesLocales(clases.map((x) => (x.id === c.id ? { ...x, ...c } : x)))}
                onEliminada={(id) => setClasesLocales(clases.filter((x) => x.id !== id))}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

/** Ingreso al panel para quien no tiene una sesión de administrador. */
function AccesoAdmin() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [enviando, setEnviando] = useState(false);

  const ingresar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const data = await api.post<LoginResponse>("/auth/login", form);
      if (data.user.tipoUsuario !== "ADMIN") throw new Error("Esta cuenta no tiene permisos de administrador");
      login(data);
      toast.success("Sesión de administrador iniciada");
    } catch (err: unknown) {
      toast.error("No se pudo ingresar", { description: err instanceof Error ? err.message : "Verificá tus datos" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <form onSubmit={ingresar} className="w-full max-w-md space-y-5 rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-sm font-medium text-lime-600 dark:text-lime-400">PadeLink</p>
          <h1 className="mt-1 text-2xl font-bold">Acceso de administrador</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Ingresá con una cuenta autorizada para administrar la plataforma.</p>
        </div>
        <Campo etiqueta="Email">
          <Entrada required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Campo>
        <Campo etiqueta="Contraseña">
          <Entrada required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Campo>
        <button type="submit" disabled={enviando} className={`${BOTON.primario} w-full py-2.5`}>
          {enviando ? "Ingresando..." : "Ingresar al panel"}
        </button>
      </form>
    </main>
  );
}
