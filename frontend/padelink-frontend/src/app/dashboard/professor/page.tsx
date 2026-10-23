"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import FilaClase from "@/components/panel/FilaClase";
import FormularioClase from "@/components/panel/FormularioClase";
import ListaInscriptos from "@/components/panel/ListaInscriptos";
import { BOTON, EncabezadoPanel, GrillaDatos, Pestanas, Tarjeta, TarjetaDato } from "@/components/panel/ElementosPanel";
import { Selector } from "@/components/filtros/CamposFiltro";
import { AreaTexto, Campo, Desplegable, Entrada } from "@/components/ui/Formulario";
import { Avatar, Calificacion, Etiqueta } from "@/components/ui/Elementos";
import { CargandoTarjetas, MensajeError, SinResultados } from "@/components/ui/EstadosListado";
import { useAuth } from "@/context/AuthContext";
import { useApiGet } from "@/hooks/useApiGet";
import { api } from "@/lib/api";
import { aplicarFiltros } from "@/lib/filters";
import { porEstado, porTipo, type EstadoVisible } from "@/lib/clases";
import { formatCalificacion, formatFechaCorta, formatMonto, formatNivel, formatPrecio, nombreCompleto, plural } from "@/lib/format";
import { resumenProfesor, separarPorFecha } from "@/lib/paneles";
import type { AlumnoInscripto, ClaseListado, Club, ProfesorResumen } from "@/types";

type PestanaProfesor = "proximas" | "historial" | "alumnos" | "perfil";

type PerfilProfesor = ProfesorResumen & { usuario: ProfesorResumen["usuario"] & { telefono?: string } };

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const id = user?.usuario_id;
  const perfilApi = useApiGet<PerfilProfesor>(id ? `/profesor/${id}` : null);
  const clasesApi = useApiGet<ClaseListado[]>(id ? `/clase/profesor/${id}` : null);
  const clubesApi = useApiGet<Club[]>("/club");

  // Cambios hechos en esta pantalla, aplicados sobre lo que vino del servidor
  const [clasesLocales, setClasesLocales] = useState<ClaseListado[] | null>(null);
  const [clubesExtra, setClubesExtra] = useState<Club[]>([]);
  const clases = useMemo(() => clasesLocales ?? clasesApi.data ?? [], [clasesLocales, clasesApi.data]);
  const clubes = useMemo(() => [...(clubesApi.data ?? []), ...clubesExtra], [clubesApi.data, clubesExtra]);

  const [pestana, setPestana] = useState<PestanaProfesor>("proximas");
  const [formulario, setFormulario] = useState<{ abierto: boolean; clase: ClaseListado | null }>({ abierto: false, clase: null });
  const [aEliminar, setAEliminar] = useState<ClaseListado | null>(null);
  const [aQuitar, setAQuitar] = useState<{ clase: ClaseListado; alumno: AlumnoInscripto } | null>(null);
  const [filtroHistorial, setFiltroHistorial] = useState<{ estado: EstadoVisible | ""; tipo: string }>({ estado: "", tipo: "" });

  const perfil = perfilApi.data;
  const resumen = useMemo(() => resumenProfesor(clases, perfil), [clases, perfil]);
  // Historial = clases ya dadas + canceladas, de la más reciente a la más vieja
  const historialCompleto = useMemo(() => {
    const { pasadas, canceladas } = separarPorFecha(clases);
    return [...pasadas, ...canceladas].sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
  }, [clases]);
  const historial = useMemo(
    () => aplicarFiltros(historialCompleto, [porEstado(filtroHistorial.estado), porTipo(filtroHistorial.tipo)]),
    [historialCompleto, filtroHistorial],
  );

  const actualizarClases = (cambio: (actuales: ClaseListado[]) => ClaseListado[]) => setClasesLocales(cambio(clases));

  const alGuardarClase = (guardada: ClaseListado, esNueva: boolean) => {
    actualizarClases((actuales) => (esNueva ? [...actuales, guardada] : actuales.map((c) => (c.id === guardada.id ? { ...c, ...guardada } : c))));
    setFormulario({ abierto: false, clase: null });
  };

  const eliminarClase = async () => {
    if (!aEliminar) return;
    try {
      await api.delete(`/clase/${aEliminar.id}`);
      actualizarClases((actuales) => actuales.filter((c) => c.id !== aEliminar.id));
      toast.success("Clase eliminada");
    } catch (err: unknown) {
      toast.error("No se pudo eliminar", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setAEliminar(null);
    }
  };

  const quitarAlumno = async () => {
    if (!aQuitar) return;
    const { clase, alumno } = aQuitar;
    try {
      await api.delete(`/clase/${clase.id}/reserve/${alumno.usuario_id}`);
      actualizarClases((actuales) =>
        actuales.map((c) =>
          c.id === clase.id
            ? { ...c, estado: c.estado === "COMPLETA" ? "DISPONIBLE" : c.estado, alumnos_inscritos: (c.alumnos_inscritos ?? []).filter((a) => a.usuario_id !== alumno.usuario_id) }
            : c,
        ),
      );
      toast.success("Alumno quitado de la clase");
    } catch (err: unknown) {
      toast.error("No se pudo quitar al alumno", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setAQuitar(null);
    }
  };

  if (!user) return null;
  const cargando = perfilApi.loading || clasesApi.loading;
  const error = perfilApi.error || clasesApi.error;
  const calificacion = formatCalificacion(perfil?.promedioCalificacion);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-12">
        <EncabezadoPanel
          usuario={user}
          saludo={`Hola, ${user.nombre}`}
          subtitulo={perfil ? `Grupal ${formatPrecio(perfil.precioClaseGrupal)} por persona · Individual ${formatPrecio(perfil.precioClaseIndividual)}` : undefined}
          acciones={
            <>
              <Link href={`/professors/${user.usuario_id}`} className={BOTON.secundario}>
                Ver mi perfil público
              </Link>
              <button type="button" onClick={() => setFormulario({ abierto: true, clase: null })} className={BOTON.primario}>
                + Nueva clase
              </button>
            </>
          }
        />

        {cargando ? (
          <CargandoTarjetas cantidad={4} />
        ) : error ? (
          <MensajeError
            mensaje={error}
            onReintentar={() => {
              perfilApi.recargar();
              clasesApi.recargar();
            }}
          />
        ) : (
          <>
            <GrillaDatos>
              <TarjetaDato
                etiqueta="Próxima clase"
                tono="lima"
                valor={resumen.proxima ? formatFechaCorta(new Date(resumen.proxima.fecha_hora)) : "—"}
                detalle={resumen.proxima ? `${resumen.proxima.club?.nombre ?? ""} · ${plural(resumen.proxima.alumnos_inscritos?.length ?? 0, "inscripto", "inscriptos")}` : "No tenés clases programadas"}
              />
              <TarjetaDato etiqueta="Alumnos inscriptos" valor={resumen.inscriptosProximos} detalle={`en ${plural(resumen.proximas.length, "clase próxima", "clases próximas")}`} />
              <TarjetaDato
                etiqueta="Ocupación"
                valor={`${resumen.ocupacion}%`}
                tono={resumen.ocupacion >= 75 ? "lima" : resumen.ocupacion >= 40 ? "ambar" : "neutro"}
                detalle="de los lugares de tus próximas clases"
              />
              <TarjetaDato
                etiqueta="Ingresos estimados"
                valor={formatMonto(resumen.ingresosProximos)}
                detalle={calificacion ? `próximas clases · ★ ${calificacion}` : "próximas clases"}
              />
            </GrillaDatos>

            <Pestanas
              activa={pestana}
              onCambiar={setPestana}
              pestanas={[
                { id: "proximas", etiqueta: "Próximas clases", cantidad: resumen.proximas.length },
                { id: "historial", etiqueta: "Historial", cantidad: historialCompleto.length },
                { id: "alumnos", etiqueta: "Mis alumnos", cantidad: resumen.alumnos.length },
                { id: "perfil", etiqueta: "Mi perfil" },
              ]}
            />

            {pestana === "proximas" &&
              (resumen.proximas.length === 0 ? (
                <SinResultados mensaje="No tenés clases próximas. Creá una para que los alumnos puedan reservar." />
              ) : (
                <div className="space-y-3">
                  {resumen.proximas.map((clase) => (
                    <FilaClase
                      key={clase.id}
                      clase={clase}
                      detalle={<ListaInscriptos alumnos={clase.alumnos_inscritos ?? []} onQuitar={(alumno) => setAQuitar({ clase, alumno })} />}
                      acciones={
                        <>
                          <button type="button" onClick={() => setFormulario({ abierto: true, clase })} className={BOTON.secundario}>
                            Editar
                          </button>
                          <button type="button" onClick={() => setAEliminar(clase)} className={BOTON.peligro}>
                            Eliminar
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              ))}

            {pestana === "historial" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="w-48">
                    <Selector
                      etiqueta="Estado"
                      valor={filtroHistorial.estado}
                      opciones={[
                        { valor: "" as const, etiqueta: "Todos los estados" },
                        { valor: "finalizada" as const, etiqueta: "Finalizadas" },
                        { valor: "cancelada" as const, etiqueta: "Canceladas" },
                      ]}
                      onCambiar={(v) => setFiltroHistorial((f) => ({ ...f, estado: v }))}
                    />
                  </div>
                  <div className="w-48">
                    <Selector
                      etiqueta="Tipo"
                      valor={filtroHistorial.tipo}
                      opciones={[
                        { valor: "", etiqueta: "Todos los tipos" },
                        { valor: "GRUPAL", etiqueta: "Grupales" },
                        { valor: "LIBRE", etiqueta: "Libres" },
                      ]}
                      onCambiar={(v) => setFiltroHistorial((f) => ({ ...f, tipo: v }))}
                    />
                  </div>
                </div>
                {historial.length === 0 ? (
                  <SinResultados mensaje="No hay clases en el historial con esos filtros." />
                ) : (
                  <div className="space-y-3">
                    {historial.map((clase) => (
                      <FilaClase key={clase.id} clase={clase} detalle={<ListaInscriptos alumnos={clase.alumnos_inscritos ?? []} />} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {pestana === "alumnos" &&
              (resumen.alumnos.length === 0 ? (
                <SinResultados mensaje="Todavía no tenés alumnos inscriptos." />
              ) : (
                <Tarjeta titulo="Mis alumnos" descripcion="Todos los alumnos que se inscribieron a tus clases.">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {resumen.alumnos.map(({ alumno, clases: total, proximas }) => (
                      <div key={alumno.usuario_id} className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                        <Avatar usuario={alumno.usuario} tamano="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{alumno.usuario ? nombreCompleto(alumno.usuario) : `Alumno #${alumno.usuario_id}`}</p>
                          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{alumno.usuario?.email}</p>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {total} {total === 1 ? "clase" : "clases"}
                            {proximas > 0 && ` · ${proximas} próxima${proximas === 1 ? "" : "s"}`}
                          </p>
                        </div>
                        {alumno.nivel && <Etiqueta>{formatNivel(alumno.nivel)}</Etiqueta>}
                      </div>
                    ))}
                  </div>
                </Tarjeta>
              ))}

            {pestana === "perfil" && perfil && <FormularioPerfilProfesor perfilInicial={perfil} onGuardado={() => perfilApi.recargar({ silencioso: true })} />}
          </>
        )}
      </main>

      {formulario.abierto && (
        <FormularioClase
          clase={formulario.clase}
          clubes={clubes}
          onCerrar={() => setFormulario({ abierto: false, clase: null })}
          onGuardada={alGuardarClase}
          onClubCreado={(club) => setClubesExtra((c) => [...c, club])}
        />
      )}

      <Modal
        isOpen={aEliminar !== null}
        onClose={() => setAEliminar(null)}
        onConfirm={eliminarClase}
        title="¿Eliminar clase?"
        description={
          aEliminar
            ? `Se eliminará la clase del ${formatFechaCorta(new Date(aEliminar.fecha_hora))}${aEliminar.alumnos_inscritos?.length ? ` y sus ${aEliminar.alumnos_inscritos.length} reservas` : ""}. Si solo querés suspenderla, editala y marcala como cancelada.`
            : ""
        }
        confirmLabel="Eliminar clase"
        cancelLabel="Volver"
        variant="danger"
      />

      <Modal
        isOpen={aQuitar !== null}
        onClose={() => setAQuitar(null)}
        onConfirm={quitarAlumno}
        title="¿Quitar alumno?"
        description={aQuitar?.alumno.usuario ? `${nombreCompleto(aQuitar.alumno.usuario)} dejará de estar inscripto en esta clase.` : ""}
        confirmLabel="Quitar de la clase"
        cancelLabel="Volver"
        variant="danger"
      />
    </div>
  );
}

function FormularioPerfilProfesor({ perfilInicial, onGuardado }: { perfilInicial: PerfilProfesor; onGuardado: () => void }) {
  const { user, token, login } = useAuth();
  const [datos, setDatos] = useState({
    nombre: perfilInicial.usuario.nombre,
    apellido: perfilInicial.usuario.apellido,
    email: perfilInicial.usuario.email ?? "",
    telefono: perfilInicial.usuario.telefono ?? "",
    bio: perfilInicial.bio ?? "",
    precioClaseGrupal: Number(perfilInicial.precioClaseGrupal ?? 0),
    precioClaseIndividual: Number(perfilInicial.precioClaseIndividual ?? 0),
    manoDominante: perfilInicial.manoDominante ?? "",
    linkAjpp: perfilInicial.linkAjpp ?? "",
  });
  const [guardando, setGuardando] = useState(false);

  const cambiar = <K extends keyof typeof datos>(clave: K, valor: (typeof datos)[K]) => setDatos((d) => ({ ...d, [clave]: valor }));

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setGuardando(true);
    try {
      await api.patch(`/profesor/${user.usuario_id}`, { ...datos, manoDominante: datos.manoDominante || undefined });
      // El nombre también se muestra en el menú: se actualiza la sesión
      if (token) login({ access_token: token, user: { ...user, nombre: datos.nombre, apellido: datos.apellido, email: datos.email } });
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
      <Tarjeta titulo="Así te ven los alumnos">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Avatar usuario={datos} />
            <div>
              <p className="font-semibold">
                {datos.nombre} {datos.apellido}
              </p>
              <Calificacion valor={perfilInicial.promedioCalificacion} />
            </div>
          </div>
          <p className="line-clamp-4 text-zinc-600 dark:text-zinc-400">{datos.bio || "Agregá una biografía para presentarte."}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800/60">
              <p className="text-xs text-zinc-500">Grupal</p>
              <p className="font-bold tabular-nums">{formatPrecio(datos.precioClaseGrupal)}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800/60">
              <p className="text-xs text-zinc-500">Individual</p>
              <p className="font-bold tabular-nums">{formatPrecio(datos.precioClaseIndividual)}</p>
            </div>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Datos del perfil">
        <form onSubmit={guardar} className="grid gap-5 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            <Entrada required value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
          </Campo>
          <Campo etiqueta="Apellido">
            <Entrada required value={datos.apellido} onChange={(e) => cambiar("apellido", e.target.value)} />
          </Campo>
          <Campo etiqueta="Email">
            <Entrada required type="email" value={datos.email} onChange={(e) => cambiar("email", e.target.value)} />
          </Campo>
          <Campo etiqueta="Teléfono">
            <Entrada value={datos.telefono} onChange={(e) => cambiar("telefono", e.target.value)} />
          </Campo>
          <Campo etiqueta="Biografía" ayuda="Contá tu experiencia y cómo son tus clases." className="sm:col-span-2">
            <AreaTexto rows={4} value={datos.bio} onChange={(e) => cambiar("bio", e.target.value)} />
          </Campo>
          <Campo etiqueta="Precio clase grupal" ayuda="Por persona, en pesos.">
            <Entrada type="number" min={0} step={500} value={datos.precioClaseGrupal} onChange={(e) => cambiar("precioClaseGrupal", Number(e.target.value))} />
          </Campo>
          <Campo etiqueta="Precio clase individual" ayuda="Por clase, en pesos.">
            <Entrada type="number" min={0} step={500} value={datos.precioClaseIndividual} onChange={(e) => cambiar("precioClaseIndividual", Number(e.target.value))} />
          </Campo>
          <Campo etiqueta="Mano dominante">
            <Desplegable value={datos.manoDominante} onChange={(e) => cambiar("manoDominante", e.target.value)}>
              <option value="">Sin indicar</option>
              <option value="diestro">Diestro</option>
              <option value="zurdo">Zurdo</option>
            </Desplegable>
          </Campo>
          <Campo etiqueta="Link AJPP (opcional)">
            <Entrada type="url" value={datos.linkAjpp} onChange={(e) => cambiar("linkAjpp", e.target.value)} placeholder="https://..." />
          </Campo>
          <div className="flex justify-end sm:col-span-2">
            <button type="submit" disabled={guardando} className={BOTON.primario}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Tarjeta>
    </div>
  );
}
