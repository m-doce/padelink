// Reglas de negocio y filtros del listado de profesores, independientes de la interfaz.
import type { ClaseListado, ProfesorResumen } from "@/types";
import { aNumero, nombreCompleto, normalizarTexto } from "./format";
import { esReservable } from "./clases";
import type { OpcionOrden, PredicadoOpcional } from "./filters";

/** Profesor con datos calculados a partir de sus clases (dónde enseña, qué niveles, etc.). */
export interface ProfesorConDatos extends ProfesorResumen {
  ciudades: string[];
  clubes: string[];
  niveles: string[];
  clasesDisponibles: number;
}

/**
 * Cruza profesores con clases para saber en qué ciudades y niveles enseña cada uno.
 * Solo cuenta las clases que todavía se pueden reservar.
 */
export function enriquecerProfesores(
  profesores: readonly ProfesorResumen[],
  clases: readonly ClaseListado[],
  ahora: Date = new Date(),
): ProfesorConDatos[] {
  const porProfesor = new Map<number, ClaseListado[]>();
  for (const clase of clases) {
    const id = clase.profesor?.usuario_id;
    if (id === undefined || !esReservable(clase, ahora)) continue;
    porProfesor.set(id, [...(porProfesor.get(id) ?? []), clase]);
  }

  return profesores.map((profesor) => {
    const suyas = porProfesor.get(profesor.usuario_id) ?? [];
    const unicos = (valores: (string | null | undefined)[]) =>
      [...new Set(valores.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b, "es"));
    return {
      ...profesor,
      ciudades: unicos(suyas.map((c) => c.club?.ciudad)),
      clubes: unicos(suyas.map((c) => c.club?.nombre)),
      niveles: unicos(suyas.map((c) => c.nivel?.toLowerCase())),
      clasesDisponibles: suyas.length,
    };
  });
}

// ---------- Precio según modalidad ----------

export const MODALIDADES = [
  { id: "", etiqueta: "Cualquier modalidad" },
  { id: "grupal", etiqueta: "Clase grupal" },
  { id: "individual", etiqueta: "Clase individual" },
] as const;
export type Modalidad = (typeof MODALIDADES)[number]["id"];

export function precioSegunModalidad(profesor: ProfesorResumen, modalidad: Modalidad): number | null {
  const grupal = aNumero(profesor.precioClaseGrupal);
  const individual = aNumero(profesor.precioClaseIndividual);
  const validos = (valores: (number | null)[]) => valores.filter((n): n is number => n !== null && n > 0);
  if (modalidad === "grupal") return validos([grupal])[0] ?? null;
  if (modalidad === "individual") return validos([individual])[0] ?? null;
  const ambos = validos([grupal, individual]);
  return ambos.length ? Math.min(...ambos) : null;
}

// ---------- Opciones de filtros ----------

export const PRECIOS_MAXIMOS = [10000, 15000, 20000, 25000, 30000] as const;

export const CALIFICACIONES_MINIMAS = [
  { valor: 0, etiqueta: "Todas" },
  { valor: 3, etiqueta: "3+" },
  { valor: 4, etiqueta: "4+" },
  { valor: 4.5, etiqueta: "4,5+" },
] as const;

export interface FiltrosProfesor {
  busqueda: string;
  ciudad: string;
  nivel: string;
  modalidad: Modalidad;
  precioMaximo: number; // 0 = sin límite
  calificacionMinima: number;
  soloConClases: boolean;
  orden: OrdenProfesor;
}

export const FILTROS_PROFESOR_POR_DEFECTO: FiltrosProfesor = {
  busqueda: "",
  ciudad: "",
  nivel: "",
  modalidad: "",
  precioMaximo: 0,
  calificacionMinima: 0,
  soloConClases: false,
  orden: "calificacion",
};

// ---------- Predicados (uno por filtro) ----------

export const porNombre = (texto: string): PredicadoOpcional<ProfesorConDatos> => {
  const buscado = normalizarTexto(texto);
  return !buscado ? null : (p) => normalizarTexto(nombreCompleto(p.usuario)).includes(buscado);
};

export const porCiudad = (ciudad: string): PredicadoOpcional<ProfesorConDatos> =>
  !ciudad ? null : (p) => p.ciudades.includes(ciudad);

export const porNivelQueEnsena = (nivel: string): PredicadoOpcional<ProfesorConDatos> =>
  !nivel ? null : (p) => p.niveles.includes(nivel);

export const porPrecioMaximo = (maximo: number, modalidad: Modalidad): PredicadoOpcional<ProfesorConDatos> =>
  !maximo
    ? null
    : (p) => {
        const precio = precioSegunModalidad(p, modalidad);
        return precio !== null && precio <= maximo;
      };

export const porModalidad = (modalidad: Modalidad): PredicadoOpcional<ProfesorConDatos> =>
  !modalidad ? null : (p) => precioSegunModalidad(p, modalidad) !== null;

export const porCalificacionMinima = (minima: number): PredicadoOpcional<ProfesorConDatos> =>
  !minima ? null : (p) => (aNumero(p.promedioCalificacion) ?? 0) >= minima;

export const conClasesDisponibles = (activo: boolean): PredicadoOpcional<ProfesorConDatos> =>
  !activo ? null : (p) => p.clasesDisponibles > 0;

export function predicadosDeProfesor(filtros: FiltrosProfesor): PredicadoOpcional<ProfesorConDatos>[] {
  return [
    porNombre(filtros.busqueda),
    porCiudad(filtros.ciudad),
    porNivelQueEnsena(filtros.nivel),
    porModalidad(filtros.modalidad),
    porPrecioMaximo(filtros.precioMaximo, filtros.modalidad),
    porCalificacionMinima(filtros.calificacionMinima),
    conClasesDisponibles(filtros.soloConClases),
  ];
}

// ---------- Orden ----------

const porNombreAZ = (a: ProfesorConDatos, b: ProfesorConDatos) =>
  nombreCompleto(a.usuario).localeCompare(nombreCompleto(b.usuario), "es");

export const ORDENES_PROFESOR = {
  calificacion: {
    etiqueta: "Mejor calificados",
    comparar: (a, b) =>
      (aNumero(b.promedioCalificacion) ?? 0) - (aNumero(a.promedioCalificacion) ?? 0) || porNombreAZ(a, b),
  },
  precio: {
    etiqueta: "Menor precio",
    comparar: (a, b) =>
      (precioSegunModalidad(a, "") ?? Infinity) - (precioSegunModalidad(b, "") ?? Infinity) || porNombreAZ(a, b),
  },
  clases: {
    etiqueta: "Más clases disponibles",
    comparar: (a, b) => b.clasesDisponibles - a.clasesDisponibles || porNombreAZ(a, b),
  },
  nombre: { etiqueta: "Nombre (A-Z)", comparar: porNombreAZ },
} satisfies Record<string, OpcionOrden<ProfesorConDatos>>;
export type OrdenProfesor = keyof typeof ORDENES_PROFESOR;
