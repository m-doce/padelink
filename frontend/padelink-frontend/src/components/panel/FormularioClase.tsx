"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "@/lib/api";
import { NIVELES } from "@/lib/clases";
import { normalizarTexto } from "@/lib/format";
import { Campo, AreaTexto, Desplegable, Entrada } from "@/components/ui/Formulario";
import { BOTON } from "./ElementosPanel";
import type { ClaseListado, Club, EstadoClase, TipoClase } from "@/types";

registerLocale("es", es);

const CAPACIDAD_LIBRE = 4; // el backend fija este cupo para las clases libres
const DURACIONES = [30, 45, 60, 90, 120];

interface FormularioClaseProps {
  /** Clase a editar; null para crear una nueva. */
  clase: ClaseListado | null;
  clubes: Club[];
  onCerrar: () => void;
  onGuardada: (clase: ClaseListado, esNueva: boolean) => void;
  onClubCreado: (club: Club) => void;
}

const idDeClub = (club: Club | null | undefined) => club?.club_id ?? club?.id ?? null;

/** Modal para crear o editar una clase. Solo se ocupa del formulario; quién la muestra decide qué hacer al guardar. */
export default function FormularioClase({ clase, clubes, onCerrar, onGuardada, onClubCreado }: FormularioClaseProps) {
  const editando = clase !== null;
  const [fecha, setFecha] = useState<Date | null>(clase ? new Date(clase.fecha_hora) : null);
  const [datos, setDatos] = useState({
    duracion_minutos: clase?.duracion_minutos ?? 60,
    nivel: clase?.nivel ?? "",
    clubId: idDeClub(clase?.club as Club | undefined),
    capacidad_maxima: clase?.capacidad_maxima ?? 4,
    descripcion: clase?.descripcion ?? "",
    tipo_clase: (clase?.tipo_clase ?? "GRUPAL") as TipoClase,
    estado: (clase?.estado ?? "DISPONIBLE") as EstadoClase,
  });
  const [busquedaClub, setBusquedaClub] = useState(clase?.club?.nombre ?? "");
  const [mostrarClubes, setMostrarClubes] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cambiar = <K extends keyof typeof datos>(clave: K, valor: (typeof datos)[K]) => setDatos((d) => ({ ...d, [clave]: valor }));

  const clubesFiltrados = clubes.filter((c) => normalizarTexto(c.nombre).includes(normalizarTexto(busquedaClub)));
  const existeExacto = clubes.some((c) => normalizarTexto(c.nombre) === normalizarTexto(busquedaClub));

  const elegirClub = (club: Club) => {
    cambiar("clubId", idDeClub(club));
    setBusquedaClub(club.nombre);
    setMostrarClubes(false);
  };

  const crearClub = async () => {
    const nombre = busquedaClub.trim();
    if (!nombre) return;
    try {
      const nuevo = await api.post<Club>("/club", { nombre, ubicacion: "A definir" });
      onClubCreado(nuevo);
      elegirClub(nuevo);
      toast.success(`Club "${nuevo.nombre}" creado`);
    } catch (err: unknown) {
      toast.error("No se pudo crear el club", { description: err instanceof Error ? err.message : undefined });
    }
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (!fecha) return toast.error("Elegí la fecha y la hora de la clase");
    if (!datos.clubId) return toast.error("Elegí un club de la lista o creá uno nuevo");

    const cuerpo = {
      fecha_hora: fecha.toISOString(),
      duracion_minutos: datos.duracion_minutos,
      nivel: datos.nivel || undefined,
      capacidad_maxima: datos.tipo_clase === "LIBRE" ? CAPACIDAD_LIBRE : datos.capacidad_maxima,
      descripcion: datos.descripcion || undefined,
      tipo_clase: datos.tipo_clase,
      clubId: datos.clubId,
      ...(editando && { estado: datos.estado }),
    };

    setGuardando(true);
    try {
      // Al crear, el backend toma el profesor del token
      const guardada = editando
        ? await api.patch<ClaseListado>(`/clase/${clase.id}`, cuerpo)
        : await api.post<ClaseListado>("/clase", cuerpo);
      onGuardada(guardada, !editando);
      toast.success(editando ? "Clase actualizada" : "Clase creada");
    } catch (err: unknown) {
      toast.error("No se pudo guardar la clase", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario-clase">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="titulo-formulario-clase" className="text-xl font-bold">
            {editando ? "Editar clase" : "Nueva clase"}
          </h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={guardar} className="space-y-4">
          <Campo etiqueta="Tipo de clase">
            <div className="grid grid-cols-2 gap-2">
              {(["GRUPAL", "LIBRE"] as const).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => cambiar("tipo_clase", tipo)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    datos.tipo_clase === tipo ? "border-lime-500 bg-lime-50 dark:bg-lime-900/20" : "border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <span className="block font-semibold">{tipo === "GRUPAL" ? "Grupal" : "Libre"}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {tipo === "GRUPAL" ? "Cupo a elección, pago por persona" : "Hasta 4 personas, individual o compartida"}
                  </span>
                </button>
              ))}
            </div>
          </Campo>

          <Campo etiqueta="Fecha y hora">
            <DatePicker
              selected={fecha}
              onChange={(d: Date | null) => setFecha(d)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Hora"
              dateFormat="dd/MM/yyyy HH:mm"
              locale="es"
              minDate={new Date()}
              placeholderText="Elegí fecha y hora"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-zinc-700 dark:bg-zinc-950"
              wrapperClassName="w-full"
            />
          </Campo>

          <div className="relative">
            <Campo etiqueta="Club" ayuda={datos.clubId ? "✓ Club seleccionado" : "Escribí para buscar. Si no existe, lo podés crear."}>
              <Entrada
                value={busquedaClub}
                placeholder="Buscar club..."
                onFocus={() => setMostrarClubes(true)}
                onBlur={() => setTimeout(() => setMostrarClubes(false), 150)}
                onChange={(e) => {
                  setBusquedaClub(e.target.value);
                  setMostrarClubes(true);
                  if (datos.clubId) cambiar("clubId", null);
                }}
              />
            </Campo>
            {mostrarClubes && (
              <div className="absolute z-[60] mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                {clubesFiltrados.map((club) => (
                  <button
                    key={idDeClub(club)}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => elegirClub(club)}
                    className="block w-full border-b border-zinc-100 px-4 py-2.5 text-left text-sm last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <span className="font-medium">{club.nombre}</span>
                    {(club.ciudad || club.ubicacion) && <span className="block text-xs text-zinc-500">{[club.ubicacion, club.ciudad].filter(Boolean).join(" · ")}</span>}
                  </button>
                ))}
                {busquedaClub.trim() && !existeExacto && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={crearClub}
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-lime-700 hover:bg-lime-50 dark:text-lime-400 dark:hover:bg-lime-900/20"
                  >
                    + Crear el club &quot;{busquedaClub.trim()}&quot;
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo etiqueta="Duración">
              <Desplegable value={datos.duracion_minutos} onChange={(e) => cambiar("duracion_minutos", Number(e.target.value))}>
                {DURACIONES.map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </Desplegable>
            </Campo>
            <Campo etiqueta="Nivel">
              <Desplegable value={datos.nivel} onChange={(e) => cambiar("nivel", e.target.value)}>
                <option value="">Todos los niveles</option>
                {NIVELES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.etiqueta}
                  </option>
                ))}
              </Desplegable>
            </Campo>
          </div>

          {datos.tipo_clase === "GRUPAL" ? (
            <Campo etiqueta="Cupos" ayuda="Cantidad máxima de alumnos (1 a 20).">
              <Entrada
                type="number"
                min={1}
                max={20}
                value={datos.capacidad_maxima}
                onChange={(e) => cambiar("capacidad_maxima", Math.max(1, Math.min(20, Number(e.target.value))))}
              />
            </Campo>
          ) : (
            <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:bg-sky-900/20 dark:text-sky-300">
              Las clases libres tienen un cupo fijo de {CAPACIDAD_LIBRE} personas.
            </p>
          )}

          {editando && (
            <Campo etiqueta="Estado" ayuda="Si cancelás la clase, deja de aparecer para los alumnos.">
              <Desplegable value={datos.estado} onChange={(e) => cambiar("estado", e.target.value as EstadoClase)}>
                <option value="DISPONIBLE">Disponible</option>
                <option value="COMPLETA">Completa</option>
                <option value="CANCELADA">Cancelada</option>
              </Desplegable>
            </Campo>
          )}

          <Campo etiqueta="Descripción (opcional)">
            <AreaTexto rows={2} value={datos.descripcion} onChange={(e) => cambiar("descripcion", e.target.value)} placeholder="Ej.: trabajo de volea y salida de pared" />
          </Campo>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCerrar} className={BOTON.secundario}>
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className={BOTON.primario}>
              {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear clase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
