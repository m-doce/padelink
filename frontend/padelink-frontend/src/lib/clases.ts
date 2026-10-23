// Reglas de negocio y filtros de las clases, independientes de la interfaz.
import type { ClaseListado, Monto, ProfesorResumen } from "@/types";
import { aNumero, normalizarTexto } from "./format";
import type { OpcionOrden, PredicadoOpcional } from "./filters";

// ---------- Estado de una clase ----------

export type EstadoVisible = "disponible" | "completa" | "cancelada" | "finalizada";

export function cuposLibres(clase: ClaseListado): number {
  return Math.max(0, clase.capacidad_maxima - (clase.alumnos_inscritos?.length ?? 0));
}

export function estadoVisible(clase: ClaseListado, ahora: Date = new Date()): EstadoVisible {
  if (clase.estado === "CANCELADA") return "cancelada";
  if (new Date(clase.fecha_hora) < ahora) return "finalizada";
  if (clase.estado === "COMPLETA" || cuposLibres(clase) === 0) return "completa";
  return "disponible";
}

export function esReservable(clase: ClaseListado, ahora: Date = new Date()): boolean {
  return estadoVisible(clase, ahora) === "disponible";
}

export function estaInscripto(clase: ClaseListado, usuarioId?: number): boolean {
  return usuarioId !== undefined && (clase.alumnos_inscritos ?? []).some((a) => a.usuario_id === usuarioId);
}

// ---------- Precios ----------

export interface LineaPrecio {
  etiqueta: string;
  detalle?: string;
  monto: Monto;
}

/**
 * Precios que aplican a una clase según su tipo.
 * - GRUPAL: precio grupal por persona.
 * - LIBRE: el alumno elige ir solo (individual) o con hasta 3 personas más (grupal por persona).
 */
export function preciosDeClase(clase: ClaseListado, profesor: ProfesorResumen | undefined = clase.profesor): LineaPrecio[] {
  if (!profesor) return [];
  if (clase.tipo_clase === "LIBRE") {
    return [
      { etiqueta: "Individual", monto: profesor.precioClaseIndividual },
      { etiqueta: "Compartida", detalle: "por persona, hasta 4", monto: profesor.precioClaseGrupal },
    ];
  }
  return [{ etiqueta: "Por persona", monto: profesor.precioClaseGrupal }];
}

export type ModoReserva = "individual" | "grupal";

/**
 * Total a pagar al reservar. En una clase GRUPAL se paga el precio grupal de una persona;
 * en una LIBRE, el precio individual o el grupal multiplicado por la cantidad de personas.
 */
export function totalReserva(
  tipo: ClaseListado["tipo_clase"],
  profesor: Pick<ProfesorResumen, "precioClaseGrupal" | "precioClaseIndividual"> | undefined,
  modo: ModoReserva,
  personas: number,
): number | null {
  if (!profesor) return null;
  const grupal = aNumero(profesor.precioClaseGrupal);
  if (tipo !== "LIBRE") return grupal;
  if (modo === "individual") return aNumero(profesor.precioClaseIndividual);
  return grupal === null ? null : grupal * personas;
}

/** El precio más bajo con el que se puede tomar la clase (para ordenar y filtrar). */
export function precioDesde(clase: ClaseListado): number | null {
  const montos = preciosDeClase(clase)
    .map((l) => aNumero(l.monto))
    .filter((n): n is number => n !== null && n > 0);
  return montos.length ? Math.min(...montos) : null;
}

// ---------- Opciones de filtros ----------

export const FRANJAS_HORARIAS = [
  { id: "manana", etiqueta: "Mañana", detalle: "6 a 12 h", desde: 6, hasta: 12 },
  { id: "tarde", etiqueta: "Tarde", detalle: "12 a 18 h", desde: 12, hasta: 18 },
  { id: "noche", etiqueta: "Noche", detalle: "18 a 24 h", desde: 18, hasta: 24 },
] as const;
export type FranjaHoraria = (typeof FRANJAS_HORARIAS)[number]["id"];

// getDay(): 0 = domingo. Se listan de lunes a domingo.
export const DIAS_SEMANA = [
  { id: 1, etiqueta: "Lun" },
  { id: 2, etiqueta: "Mar" },
  { id: 3, etiqueta: "Mié" },
  { id: 4, etiqueta: "Jue" },
  { id: 5, etiqueta: "Vie" },
  { id: 6, etiqueta: "Sáb" },
  { id: 0, etiqueta: "Dom" },
] as const;

export const RANGOS_FECHA = [
  { id: "todas", etiqueta: "Cualquier fecha" },
  { id: "hoy", etiqueta: "Hoy" },
  { id: "manana", etiqueta: "Mañana" },
  { id: "semana", etiqueta: "Próximos 7 días" },
  { id: "finde", etiqueta: "Este fin de semana" },
] as const;
export type RangoFecha = (typeof RANGOS_FECHA)[number]["id"];

export const NIVELES = [
  { id: "basico", etiqueta: "Básico" },
  { id: "intermedio", etiqueta: "Intermedio" },
  { id: "avanzado", etiqueta: "Avanzado" },
] as const;

export interface FiltrosClase {
  busqueda: string;
  rangoFecha: RangoFecha;
  dias: number[];
  franjas: FranjaHoraria[];
  nivel: string;
  club: string;
  soloConLugares: boolean;
  orden: OrdenClase;
}

export const FILTROS_CLASE_POR_DEFECTO: FiltrosClase = {
  busqueda: "",
  rangoFecha: "todas",
  dias: [],
  franjas: [],
  nivel: "",
  club: "",
  soloConLugares: false,
  orden: "fecha",
};

// ---------- Predicados (uno por filtro) ----------

const inicioDelDia = (fecha: Date, sumarDias = 0) => {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + sumarDias);
  return d;
};

/** Devuelve [desde, hasta) para un rango de fechas relativo a hoy. */
export function intervaloDeRango(rango: RangoFecha, ahora: Date): [Date, Date] | null {
  switch (rango) {
    case "hoy":
      return [ahora, inicioDelDia(ahora, 1)];
    case "manana":
      return [inicioDelDia(ahora, 1), inicioDelDia(ahora, 2)];
    case "semana":
      return [ahora, inicioDelDia(ahora, 8)];
    case "finde": {
      const dia = ahora.getDay();
      const hastaSabado = dia === 0 ? -1 : 6 - dia; // si hoy es domingo, el finde es el actual
      const sabado = inicioDelDia(ahora, hastaSabado);
      const desde = sabado < ahora ? ahora : sabado;
      return [desde, inicioDelDia(sabado, 2)];
    }
    default:
      return null;
  }
}

/** Las clases pasadas y canceladas no se ofrecen en los listados públicos. */
export const soloProximas = (ahora: Date): PredicadoOpcional<ClaseListado> => (clase) =>
  clase.estado !== "CANCELADA" && new Date(clase.fecha_hora) >= ahora;

export const porBusqueda = (texto: string): PredicadoOpcional<ClaseListado> => {
  const buscado = normalizarTexto(texto);
  if (!buscado) return null;
  return (clase) => {
    const campos = [
      clase.profesor?.usuario.nombre,
      clase.profesor?.usuario.apellido,
      clase.club?.nombre,
      clase.club?.ciudad,
      clase.descripcion,
    ];
    return campos.some((c) => c && normalizarTexto(c).includes(buscado));
  };
};

export const porRangoFecha = (rango: RangoFecha, ahora: Date): PredicadoOpcional<ClaseListado> => {
  const intervalo = intervaloDeRango(rango, ahora);
  if (!intervalo) return null;
  const [desde, hasta] = intervalo;
  return (clase) => {
    const fecha = new Date(clase.fecha_hora);
    return fecha >= desde && fecha < hasta;
  };
};

export const porDiasSemana = (dias: number[]): PredicadoOpcional<ClaseListado> =>
  dias.length === 0 ? null : (clase) => dias.includes(new Date(clase.fecha_hora).getDay());

export const porFranjas = (franjas: FranjaHoraria[]): PredicadoOpcional<ClaseListado> => {
  if (franjas.length === 0) return null;
  const elegidas = FRANJAS_HORARIAS.filter((f) => franjas.includes(f.id));
  return (clase) => {
    const hora = new Date(clase.fecha_hora).getHours();
    return elegidas.some((f) => hora >= f.desde && hora < f.hasta);
  };
};

export const porNivel = (nivel: string): PredicadoOpcional<ClaseListado> =>
  !nivel ? null : (clase) => (clase.nivel ?? "").toLowerCase() === nivel;

export const porClub = (club: string): PredicadoOpcional<ClaseListado> =>
  !club ? null : (clase) => clase.club?.nombre === club;

export const conLugares = (activo: boolean): PredicadoOpcional<ClaseListado> =>
  !activo ? null : (clase) => cuposLibres(clase) > 0 && clase.estado !== "COMPLETA";

export const porTipo = (tipo: string): PredicadoOpcional<ClaseListado> =>
  !tipo ? null : (clase) => clase.tipo_clase === tipo;

export const porEstado = (estado: EstadoVisible | "", ahora: Date = new Date()): PredicadoOpcional<ClaseListado> =>
  !estado ? null : (clase) => estadoVisible(clase, ahora) === estado;

export const ESTADOS_VISIBLES: { id: EstadoVisible; etiqueta: string }[] = [
  { id: "disponible", etiqueta: "Con lugares" },
  { id: "completa", etiqueta: "Completas" },
  { id: "finalizada", etiqueta: "Finalizadas" },
  { id: "cancelada", etiqueta: "Canceladas" },
];

// ---------- Filtros de la gestión de clases (admin) ----------

export const MOMENTOS = [
  { id: "proximas", etiqueta: "Próximas" },
  { id: "pasadas", etiqueta: "Pasadas" },
  { id: "", etiqueta: "Todas" },
] as const;
export type Momento = (typeof MOMENTOS)[number]["id"];

export const porMomento = (momento: Momento, ahora: Date): PredicadoOpcional<ClaseListado> => {
  if (momento === "proximas") return (clase) => new Date(clase.fecha_hora) >= ahora;
  if (momento === "pasadas") return (clase) => new Date(clase.fecha_hora) < ahora;
  return null;
};

export const porProfesor = (profesorId: number): PredicadoOpcional<ClaseListado> =>
  !profesorId ? null : (clase) => clase.profesor?.usuario_id === profesorId;

export interface FiltrosClaseAdmin {
  busqueda: string;
  momento: Momento;
  estado: EstadoVisible | "";
  tipo: string;
  profesor: number;
  club: string;
  orden: OrdenClaseAdmin;
}

export const FILTROS_CLASE_ADMIN_POR_DEFECTO: FiltrosClaseAdmin = {
  busqueda: "",
  momento: "proximas",
  estado: "",
  tipo: "",
  profesor: 0,
  club: "",
  orden: "fecha",
};

export function predicadosClaseAdmin(filtros: FiltrosClaseAdmin, ahora: Date = new Date()): PredicadoOpcional<ClaseListado>[] {
  return [
    porBusqueda(filtros.busqueda),
    porMomento(filtros.momento, ahora),
    porEstado(filtros.estado, ahora),
    porTipo(filtros.tipo),
    porProfesor(filtros.profesor),
    porClub(filtros.club),
  ];
}

/** Arma la lista de predicados a partir del estado de los filtros de la pantalla. */
export function predicadosDeClase(filtros: FiltrosClase, ahora: Date = new Date()): PredicadoOpcional<ClaseListado>[] {
  return [
    soloProximas(ahora),
    porBusqueda(filtros.busqueda),
    porRangoFecha(filtros.rangoFecha, ahora),
    porDiasSemana(filtros.dias),
    porFranjas(filtros.franjas),
    porNivel(filtros.nivel),
    porClub(filtros.club),
    conLugares(filtros.soloConLugares),
  ];
}

// ---------- Orden ----------

const porFecha = (a: ClaseListado, b: ClaseListado) =>
  new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime();

export const ORDENES_CLASE = {
  fecha: { etiqueta: "Más próximas", comparar: porFecha },
  precio: {
    etiqueta: "Menor precio",
    comparar: (a, b) => (precioDesde(a) ?? Infinity) - (precioDesde(b) ?? Infinity) || porFecha(a, b),
  },
  lugares: {
    etiqueta: "Más lugares libres",
    comparar: (a, b) => cuposLibres(b) - cuposLibres(a) || porFecha(a, b),
  },
} satisfies Record<string, OpcionOrden<ClaseListado>>;
export type OrdenClase = keyof typeof ORDENES_CLASE;

export const ORDENES_CLASE_ADMIN = {
  fecha: { etiqueta: "Fecha (más cercana)", comparar: porFecha },
  recientes: { etiqueta: "Fecha (más reciente)", comparar: (a, b) => porFecha(b, a) },
  inscriptos: {
    etiqueta: "Más inscriptos",
    comparar: (a, b) => (b.alumnos_inscritos?.length ?? 0) - (a.alumnos_inscritos?.length ?? 0) || porFecha(a, b),
  },
} satisfies Record<string, OpcionOrden<ClaseListado>>;
export type OrdenClaseAdmin = keyof typeof ORDENES_CLASE_ADMIN;
