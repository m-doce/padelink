"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import FilaClase from "@/components/panel/FilaClase";
import { BOTON, EncabezadoPanel, GrillaDatos, Pestanas, Tarjeta, TarjetaDato } from "@/components/panel/ElementosPanel";
import { Campo, Desplegable, Entrada } from "@/components/ui/Formulario";
import { Avatar } from "@/components/ui/Elementos";
import { CargandoTarjetas, MensajeError, SinResultados } from "@/components/ui/EstadosListado";
import { useAuth } from "@/context/AuthContext";
import { useApiGet } from "@/hooks/useApiGet";
import { api } from "@/lib/api";
import { NIVELES } from "@/lib/clases";
import { edadDesde, formatFechaCorta, formatNivel, nombreCompleto } from "@/lib/format";
import { resumenAlumno } from "@/lib/paneles";
import type { AlumnoProfile, ClaseListado } from "@/types";

type PestanaAlumno = "proximas" | "historial" | "perfil";

export default function StudentDashboard() {
  const { user } = useAuth();
  const id = user?.usuario_id;
  const perfilApi = useApiGet<AlumnoProfile>(id ? `/alumno/${id}` : null);
  const reservasApi = useApiGet<ClaseListado[]>(id ? `/clase/alumno/${id}` : null);

  const [pestana, setPestana] = useState<PestanaAlumno>("proximas");
  const [aCancelar, setACancelar] = useState<ClaseListado | null>(null);
  // Reservas canceladas en esta sesión: se ocultan sin volver a pedir todo al servidor
  const [canceladas, setCanceladas] = useState<number[]>([]);

  const reservas = useMemo(() => (reservasApi.data ?? []).filter((c) => !canceladas.includes(c.id)), [reservasApi.data, canceladas]);
  const resumen = useMemo(() => resumenAlumno(reservas), [reservas]);

  const cancelarReserva = async () => {
    if (!aCancelar || !id) return;
    try {
      await api.delete(`/clase/${aCancelar.id}/reserve/${id}`);
      setCanceladas((actual) => [...actual, aCancelar.id]);
      toast.success("Reserva cancelada", { description: "Liberaste tu lugar para otro alumno." });
    } catch (err: unknown) {
      toast.error("No se pudo cancelar", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setACancelar(null);
    }
  };

  if (!user) return null;

  const cargando = perfilApi.loading || reservasApi.loading;
  const error = perfilApi.error || reservasApi.error;
  const perfil = perfilApi.data;
  const descripcionPerfil = [perfil?.nivel && formatNivel(perfil.nivel), perfil?.posicion === "REVES" ? "Revés" : perfil?.posicion === "DRIVE" ? "Drive" : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-12">
        <EncabezadoPanel
          usuario={user}
          saludo={`Hola, ${user.nombre}`}
          subtitulo={descripcionPerfil || "Completá tu perfil para que los profesores te conozcan."}
          acciones={
            <Link href="/" className={BOTON.primario}>
              Buscar clases
            </Link>
          }
        />

        {cargando ? (
          <CargandoTarjetas cantidad={4} />
        ) : error ? (
          <MensajeError
            mensaje={error}
            onReintentar={() => {
              perfilApi.recargar();
              reservasApi.recargar();
            }}
          />
        ) : (
          <>
            <GrillaDatos>
              <TarjetaDato
                etiqueta="Próxima clase"
                tono="lima"
                valor={resumen.proxima ? formatFechaCorta(new Date(resumen.proxima.fecha_hora)) : "—"}
                detalle={resumen.proxima?.profesor ? `con ${nombreCompleto(resumen.proxima.profesor.usuario)}` : "No tenés clases reservadas"}
              />
              <TarjetaDato etiqueta="Clases reservadas" valor={resumen.proximas.length} detalle="próximas" />
              <TarjetaDato etiqueta="Clases tomadas" valor={resumen.pasadas.length} detalle={`con ${resumen.profesores.length} ${resumen.profesores.length === 1 ? "profesor" : "profesores"}`} />
              <TarjetaDato etiqueta="Horas entrenadas" valor={resumen.horasEntrenadas.toLocaleString("es-AR", { maximumFractionDigits: 1 })} detalle="en total" />
            </GrillaDatos>

            <Pestanas
              activa={pestana}
              onCambiar={setPestana}
              pestanas={[
                { id: "proximas", etiqueta: "Próximas clases", cantidad: resumen.proximas.length },
                { id: "historial", etiqueta: "Historial", cantidad: resumen.pasadas.length },
                { id: "perfil", etiqueta: "Mi perfil" },
              ]}
            />

            {pestana === "proximas" &&
              (resumen.proximas.length === 0 ? (
                <SinResultados mensaje="No tenés clases reservadas. ¡Buscá una y reservá tu lugar!" />
              ) : (
                <div className="space-y-3">
                  {resumen.proximas.map((clase) => (
                    <FilaClase
                      key={clase.id}
                      clase={clase}
                      mostrarProfesor
                      mostrarInscriptos={false}
                      acciones={
                        <>
                          {clase.profesor && (
                            <Link href={`/professors/${clase.profesor.usuario_id}`} className={BOTON.secundario}>
                              Ver profesor
                            </Link>
                          )}
                          <button type="button" onClick={() => setACancelar(clase)} className={BOTON.peligro}>
                            Cancelar
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              ))}

            {pestana === "historial" && (
              <div className="space-y-6">
                {resumen.profesores.length > 0 && (
                  <Tarjeta titulo="Tus profesores" descripcion="Contale a otros alumnos cómo fue tu experiencia.">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {resumen.profesores.map(({ profesor, clasesTomadas }) => (
                        <Link
                          key={profesor.usuario_id}
                          href={`/professors/${profesor.usuario_id}`}
                          className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 transition hover:border-lime-400 dark:border-zinc-800"
                        >
                          <Avatar usuario={profesor.usuario} tamano="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{nombreCompleto(profesor.usuario)}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {clasesTomadas} {clasesTomadas === 1 ? "clase" : "clases"}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-lime-600 dark:text-lime-400">Calificar →</span>
                        </Link>
                      ))}
                    </div>
                  </Tarjeta>
                )}

                {resumen.pasadas.length === 0 ? (
                  <SinResultados mensaje="Todavía no tomaste ninguna clase." />
                ) : (
                  <div className="space-y-3">
                    {resumen.pasadas.map((clase) => (
                      <FilaClase key={clase.id} clase={clase} mostrarProfesor mostrarInscriptos={false} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {pestana === "perfil" && perfil && <FormularioPerfilAlumno usuarioId={user.usuario_id} perfilInicial={perfil} onGuardado={() => perfilApi.recargar({ silencioso: true })} />}
          </>
        )}
      </main>

      <Modal
        isOpen={aCancelar !== null}
        onClose={() => setACancelar(null)}
        onConfirm={cancelarReserva}
        title="¿Cancelar reserva?"
        description={aCancelar ? `Vas a liberar tu lugar en la clase del ${formatFechaCorta(new Date(aCancelar.fecha_hora))}.` : ""}
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        variant="danger"
      />
    </div>
  );
}

function FormularioPerfilAlumno({ usuarioId, perfilInicial, onGuardado }: { usuarioId: number; perfilInicial: AlumnoProfile; onGuardado: () => void }) {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(perfilInicial);
  const [guardando, setGuardando] = useState(false);
  const edad = edadDesde(perfil.fecha_nacimiento);

  const cambiar = <K extends keyof AlumnoProfile>(clave: K, valor: AlumnoProfile[K]) => setPerfil((p) => ({ ...p, [clave]: valor }));

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      // Solo se envían los campos con valor (el backend valida cada uno)
      const datos = {
        fecha_nacimiento: perfil.fecha_nacimiento || undefined,
        edad: edad ?? undefined,
        nivel: perfil.nivel || undefined,
        mano_dominante: perfil.mano_dominante || undefined,
        genero: perfil.genero || undefined,
        posicion: perfil.posicion || undefined,
      };
      await api.patch(`/alumno/${usuarioId}`, datos);
      toast.success("Perfil actualizado");
      onGuardado();
    } catch (err: unknown) {
      toast.error("No se pudo guardar", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <Tarjeta titulo="Tu cuenta">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Nombre</dt>
            <dd className="font-medium">{user ? nombreCompleto(user) : ""}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="break-all font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Edad</dt>
            <dd className="font-medium">{edad !== null ? `${edad} años` : "Sin cargar"}</dd>
          </div>
        </dl>
      </Tarjeta>

      <Tarjeta titulo="Datos de juego" descripcion="Ayudan a los profesores a armar grupos de tu nivel.">
        <form onSubmit={guardar} className="grid gap-5 sm:grid-cols-2">
          <Campo etiqueta="Fecha de nacimiento">
            <Entrada type="date" value={perfil.fecha_nacimiento ?? ""} onChange={(e) => cambiar("fecha_nacimiento", e.target.value)} />
          </Campo>
          <Campo etiqueta="Nivel">
            <Desplegable value={perfil.nivel ?? ""} onChange={(e) => cambiar("nivel", e.target.value)}>
              <option value="">Elegí tu nivel</option>
              {NIVELES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.etiqueta}
                </option>
              ))}
            </Desplegable>
          </Campo>
          <Campo etiqueta="Posición">
            <Desplegable value={perfil.posicion ?? ""} onChange={(e) => cambiar("posicion", e.target.value)}>
              <option value="">Elegí tu posición</option>
              <option value="DRIVE">Drive</option>
              <option value="REVES">Revés</option>
            </Desplegable>
          </Campo>
          <Campo etiqueta="Mano dominante">
            <Desplegable value={perfil.mano_dominante ?? ""} onChange={(e) => cambiar("mano_dominante", e.target.value)}>
              <option value="">Elegí una opción</option>
              <option value="diestro">Diestro</option>
              <option value="zurdo">Zurdo</option>
            </Desplegable>
          </Campo>
          <Campo etiqueta="Género">
            <Desplegable value={perfil.genero ?? ""} onChange={(e) => cambiar("genero", e.target.value)}>
              <option value="">Prefiero no decirlo</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </Desplegable>
          </Campo>
          <div className="flex items-end justify-end sm:col-span-2">
            <button type="submit" disabled={guardando} className={BOTON.primario}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Tarjeta>
    </div>
  );
}
