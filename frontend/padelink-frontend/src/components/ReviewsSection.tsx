"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Resenia } from "@/types";
import Modal from "@/components/Modal";

interface ReviewsSectionProps {
  profesorId: number;
  // true si el alumno logueado tomó alguna clase con este profesor
  alumnoTomoClase: boolean;
  // Se llama después de crear, editar o borrar, para refrescar el promedio del perfil
  onChange?: () => void;
}

function Stars({ value, size = "text-base" }: { value: number; size?: string }) {
  return (
    <span className={`${size} tracking-tight`} aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "text-yellow-400" : "text-zinc-300 dark:text-zinc-700"}>
          ★
        </span>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className={`text-3xl leading-none transition ${
            n <= (hover || value) ? "text-yellow-400" : "text-zinc-300 dark:text-zinc-700"
          }`}
          aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ profesorId, alumnoTomoClase, onChange }: ReviewsSectionProps) {
  const { user } = useAuth();
  const [resenias, setResenias] = useState<Resenia[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  const esAlumno = user?.tipoUsuario === "ALUMNO";
  const miResenia = esAlumno ? resenias.find((r) => r.alumno?.usuario_id === user?.usuario_id) : undefined;

  const cargarResenias = useCallback(async () => {
    try {
      const data = await api.get<Resenia[]>(`/resenia/profesor/${profesorId}`);
      setResenias(data);
    } catch {
      // Si falla, la sección queda vacía sin romper el perfil
      setResenias([]);
    } finally {
      setLoading(false);
    }
  }, [profesorId]);

  useEffect(() => {
    cargarResenias();
  }, [cargarResenias]);

  const empezarEdicion = () => {
    setCalificacion(miResenia?.calificacion ?? 0);
    setComentario(miResenia?.comentario ?? "");
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setCalificacion(0);
    setComentario("");
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calificacion < 1) {
      toast.error("Elegí una calificación de 1 a 5 estrellas");
      return;
    }

    setEnviando(true);
    try {
      const texto = comentario.trim();
      if (miResenia) {
        await api.patch(`/resenia/${miResenia.id}`, { calificacion, comentario: texto });
        toast.success("Reseña actualizada");
      } else {
        await api.post("/resenia", { profesorId, calificacion, comentario: texto });
        toast.success("¡Gracias por tu reseña!");
      }
      cancelarEdicion();
      await cargarResenias();
      onChange?.();
    } catch (err: unknown) {
      toast.error("No se pudo guardar la reseña", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async () => {
    if (!miResenia) return;
    setConfirmarBorrado(false);
    try {
      await api.delete(`/resenia/${miResenia.id}`);
      toast.success("Reseña eliminada");
      await cargarResenias();
      onChange?.();
    } catch (err: unknown) {
      toast.error("No se pudo eliminar la reseña", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const promedio = resenias.length
    ? resenias.reduce((acc, r) => acc + r.calificacion, 0) / resenias.length
    : 0;

  const mostrarFormulario = esAlumno && alumnoTomoClase && (!miResenia || editando);

  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          Reseñas
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {resenias.length}
          </span>
        </h2>
        {resenias.length > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(promedio)} size="text-xl" />
            <span className="text-lg font-semibold">{promedio.toFixed(1)}</span>
            <span className="text-sm text-zinc-500">de 5</span>
          </div>
        )}
      </div>

      {/* Formulario para dejar o editar la reseña */}
      {mostrarFormulario && (
        <form
          onSubmit={guardar}
          className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="mb-3 font-semibold">{miResenia ? "Editá tu reseña" : "Dejá tu reseña"}</p>
          <StarPicker value={calificacion} onChange={setCalificacion} />
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Contá cómo fue tu experiencia (opcional)"
            className="mt-4 w-full rounded-lg border border-zinc-300 bg-transparent p-3 text-sm focus:border-lime-500 focus:outline-none dark:border-zinc-700"
          />
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"
            >
              {enviando ? "Guardando..." : miResenia ? "Guardar cambios" : "Publicar reseña"}
            </button>
            {editando && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="rounded-lg px-5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {/* Mensajes cuando no se puede reseñar */}
      {!user && (
        <p className="mb-8 text-sm text-zinc-500">
          <Link href="/login" className="font-medium text-lime-600 hover:underline dark:text-lime-400">
            Iniciá sesión
          </Link>{" "}
          como alumno para dejar una reseña.
        </p>
      )}
      {esAlumno && !alumnoTomoClase && !miResenia && (
        <p className="mb-8 text-sm text-zinc-500">
          Vas a poder dejar una reseña después de reservar una clase con este profesor.
        </p>
      )}

      {/* Listado */}
      {loading ? (
        <p className="text-zinc-500 animate-pulse">Cargando reseñas...</p>
      ) : resenias.length === 0 ? (
        <p className="text-zinc-500">Este profesor todavía no tiene reseñas.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {resenias.map((r) => {
            const esMia = r.id === miResenia?.id;
            const nombre = r.alumno?.usuario
              ? `${r.alumno.usuario.nombre} ${r.alumno.usuario.apellido[0] ?? ""}.`
              : "Alumno";
            return (
              <li
                key={r.id}
                className={`rounded-xl border bg-white p-5 shadow-sm dark:bg-zinc-900 ${
                  esMia ? "border-lime-400 dark:border-lime-600" : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {nombre}
                      {esMia && <span className="ml-2 text-xs font-medium text-lime-600 dark:text-lime-400">(vos)</span>}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(r.fecha_creacion).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <Stars value={r.calificacion} />
                </div>
                {r.comentario && (
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{r.comentario}</p>
                )}
                {esMia && !editando && (
                  <div className="mt-4 flex gap-4 text-sm">
                    <button onClick={empezarEdicion} className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
                      Editar
                    </button>
                    <button onClick={() => setConfirmarBorrado(true)} className="font-medium text-red-600 hover:underline">
                      Eliminar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        isOpen={confirmarBorrado}
        onClose={() => setConfirmarBorrado(false)}
        onConfirm={borrar}
        title="Eliminar reseña"
        description="¿Seguro que querés eliminar tu reseña? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </section>
  );
}
