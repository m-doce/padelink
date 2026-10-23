"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import FilaClase from "@/components/panel/FilaClase";
import { BOTON, Tarjeta } from "@/components/panel/ElementosPanel";
import { Buscador, Chips, Interruptor, Selector } from "@/components/filtros/CamposFiltro";
import { Campo, Entrada } from "@/components/ui/Formulario";
import { Avatar, Etiqueta } from "@/components/ui/Elementos";
import { SinResultados } from "@/components/ui/EstadosListado";
import { useFiltros } from "@/hooks/useFiltros";
import { api } from "@/lib/api";
import { nombreCompleto, plural } from "@/lib/format";
import { FILTROS_USUARIO_POR_DEFECTO, NOMBRES_ROL, ORDENES_USUARIO, predicadosDeUsuario, type OrdenUsuario } from "@/lib/usuarios";
import type { ClaseListado, UserRole, UsuarioAdmin } from "@/types";

type DetalleUsuario = UsuarioAdmin & { clases?: ClaseListado[]; reservas?: ClaseListado[] };

const TONO_ROL: Record<UserRole, "lima" | "azul" | "neutro"> = { ALUMNO: "neutro", PROFESOR: "lima", ADMIN: "azul" };
const ORDEN_OPCIONES = (Object.keys(ORDENES_USUARIO) as OrdenUsuario[]).map((valor) => ({ valor, etiqueta: ORDENES_USUARIO[valor].etiqueta }));

interface GestionUsuariosProps {
  usuarios: UsuarioAdmin[];
  idAdminActual: number;
  onActualizado: (usuario: UsuarioAdmin) => void;
  onEliminado: (id: number) => void;
}

export default function GestionUsuarios({ usuarios, idAdminActual, onActualizado, onEliminado }: GestionUsuariosProps) {
  const { filtros, cambiar, resultados } = useFiltros({
    items: usuarios,
    porDefecto: FILTROS_USUARIO_POR_DEFECTO,
    predicados: predicadosDeUsuario,
    ordenes: ORDENES_USUARIO,
  });
  const [detalle, setDetalle] = useState<DetalleUsuario | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const seleccionar = async (id: number) => {
    setCargandoDetalle(true);
    try {
      setDetalle(await api.get<DetalleUsuario>(`/admin/usuarios/${id}`));
    } catch (err: unknown) {
      toast.error("No se pudo cargar el usuario", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setCargandoDetalle(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      {/* Lista */}
      <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-3 border-b border-zinc-100 p-4 dark:border-zinc-800">
          <Buscador valor={filtros.busqueda} onCambiar={(v) => cambiar("busqueda", v)} placeholder="Nombre o email" />
          <Chips
            opciones={[
              { valor: "" as const, etiqueta: "Todos" },
              { valor: "ALUMNO" as const, etiqueta: "Alumnos" },
              { valor: "PROFESOR" as const, etiqueta: "Profesores" },
              { valor: "ADMIN" as const, etiqueta: "Admins" },
            ]}
            activo={(v) => filtros.rol === v}
            onElegir={(v) => cambiar("rol", v)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Selector
              etiqueta="Estado de la cuenta"
              valor={filtros.estado}
              opciones={[
                { valor: "" as const, etiqueta: "Cualquier estado" },
                { valor: "activo" as const, etiqueta: "Activas" },
                { valor: "inactivo" as const, etiqueta: "Inactivas" },
              ]}
              onCambiar={(v) => cambiar("estado", v)}
            />
            <Selector etiqueta="Ordenar usuarios" valor={filtros.orden} opciones={ORDEN_OPCIONES} onCambiar={(v) => cambiar("orden", v)} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{plural(resultados.length, "usuario", "usuarios")}</p>
        </div>
        <ul className="max-h-[36rem] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
          {resultados.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => seleccionar(u.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                  detalle?.id === u.id ? "bg-lime-50 dark:bg-lime-900/20" : ""
                }`}
              >
                <Avatar usuario={u} tamano="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{nombreCompleto(u)}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Etiqueta tono={TONO_ROL[u.tipoUsuario]}>{NOMBRES_ROL[u.tipoUsuario]}</Etiqueta>
                  {!u.activo && <Etiqueta tono="rojo">Inactiva</Etiqueta>}
                </div>
              </button>
            </li>
          ))}
          {resultados.length === 0 && <li className="p-8 text-center text-sm text-zinc-500">No hay usuarios con esos filtros.</li>}
        </ul>
      </section>

      {/* Detalle */}
      {cargandoDetalle ? (
        <div className="h-80 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
      ) : detalle ? (
        <DetalleDeUsuario
          key={detalle.id}
          detalle={detalle}
          esUnoMismo={detalle.id === idAdminActual}
          onActualizado={(u) => {
            setDetalle((d) => (d ? { ...d, ...u } : d));
            onActualizado(u);
          }}
          onEliminado={(id) => {
            setDetalle(null);
            onEliminado(id);
          }}
        />
      ) : (
        <SinResultados mensaje="Elegí un usuario de la lista para ver sus datos y su actividad." />
      )}
    </div>
  );
}

function DetalleDeUsuario({
  detalle,
  esUnoMismo,
  onActualizado,
  onEliminado,
}: {
  detalle: DetalleUsuario;
  esUnoMismo: boolean;
  onActualizado: (u: UsuarioAdmin) => void;
  onEliminado: (id: number) => void;
}) {
  const [datos, setDatos] = useState({
    nombre: detalle.nombre,
    apellido: detalle.apellido,
    email: detalle.email,
    telefono: detalle.telefono ?? "",
    activo: detalle.activo,
  });
  const [guardando, setGuardando] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const actividad = (detalle.tipoUsuario === "PROFESOR" ? detalle.clases : detalle.reservas) ?? [];

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      onActualizado(await api.patch<UsuarioAdmin>(`/admin/usuarios/${detalle.id}`, datos));
      toast.success("Usuario actualizado");
    } catch (err: unknown) {
      toast.error("No se pudo guardar", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    try {
      await api.delete(`/admin/usuarios/${detalle.id}`);
      toast.success("Usuario eliminado");
      onEliminado(detalle.id);
    } catch (err: unknown) {
      toast.error("No se pudo eliminar", { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <div className="space-y-6">
      <Tarjeta>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar usuario={detalle} tamano="lg" />
            <div>
              <h2 className="text-xl font-bold">{nombreCompleto(detalle)}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Etiqueta tono={TONO_ROL[detalle.tipoUsuario]}>{NOMBRES_ROL[detalle.tipoUsuario]}</Etiqueta>
                <span>Registrado el {new Date(detalle.fecha_registro).toLocaleDateString("es-AR")}</span>
              </div>
            </div>
          </div>
          {!esUnoMismo && (
            <button type="button" onClick={() => setConfirmarBorrado(true)} className={BOTON.peligro}>
              Eliminar usuario
            </button>
          )}
        </div>

        <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            <Entrada required value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
          </Campo>
          <Campo etiqueta="Apellido">
            <Entrada required value={datos.apellido} onChange={(e) => setDatos({ ...datos, apellido: e.target.value })} />
          </Campo>
          <Campo etiqueta="Email">
            <Entrada required type="email" value={datos.email} onChange={(e) => setDatos({ ...datos, email: e.target.value })} />
          </Campo>
          <Campo etiqueta="Teléfono">
            <Entrada value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} />
          </Campo>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50 sm:col-span-2">
            <Interruptor etiqueta={datos.activo ? "Cuenta activa" : "Cuenta desactivada: no puede iniciar sesión"} activo={datos.activo} onCambiar={(v) => setDatos({ ...datos, activo: v })} />
          </div>
          <div className="flex justify-end sm:col-span-2">
            <button type="submit" disabled={guardando} className={BOTON.primario}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Tarjeta>

      {detalle.tipoUsuario !== "ADMIN" && (
        <Tarjeta titulo={detalle.tipoUsuario === "PROFESOR" ? "Clases publicadas" : "Reservas"} descripcion={`${actividad.length} en total`}>
          {actividad.length === 0 ? (
            <p className="text-sm text-zinc-500">No hay actividad registrada.</p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {actividad.map((c) => (
                <FilaClase key={c.id} clase={c} mostrarProfesor={detalle.tipoUsuario === "ALUMNO"} mostrarInscriptos={detalle.tipoUsuario === "PROFESOR"} />
              ))}
            </div>
          )}
        </Tarjeta>
      )}

      <Modal
        isOpen={confirmarBorrado}
        onClose={() => setConfirmarBorrado(false)}
        onConfirm={eliminar}
        title="¿Eliminar usuario?"
        description={
          detalle.tipoUsuario === "PROFESOR"
            ? `Se eliminará a ${nombreCompleto(detalle)} junto con sus ${actividad.length} clases y las reservas de esas clases. No se puede deshacer.`
            : `Se eliminará a ${nombreCompleto(detalle)} y sus reservas. No se puede deshacer. Si solo querés bloquearlo, desactivá la cuenta.`
        }
        confirmLabel="Eliminar definitivamente"
        cancelLabel="Volver"
        variant="danger"
      />
    </div>
  );
}
