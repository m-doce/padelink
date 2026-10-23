// Cálculos de los paneles (alumno, profesor y admin), separados de la interfaz.
// Son funciones puras: reciben datos y devuelven el resumen que se muestra arriba de cada panel.
import type { AlumnoInscripto, ClaseListado, ProfesorResumen, UsuarioAdmin } from "@/types";
import { aNumero } from "./format";
import { cuposLibres, estadoVisible } from "./clases";

const esProxima = (clase: ClaseListado, ahora: Date) => new Date(clase.fecha_hora) >= ahora && clase.estado !== "CANCELADA";
const esPasada = (clase: ClaseListado, ahora: Date) => new Date(clase.fecha_hora) < ahora && clase.estado !== "CANCELADA";
const porFechaAsc = (a: ClaseListado, b: ClaseListado) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime();
const porFechaDesc = (a: ClaseListado, b: ClaseListado) => -porFechaAsc(a, b);

/** Separa las clases en próximas (de la más cercana a la más lejana) y pasadas (de la más reciente a la más vieja). */
export function separarPorFecha(clases: readonly ClaseListado[], ahora: Date = new Date()) {
  return {
    proximas: clases.filter((c) => esProxima(c, ahora)).sort(porFechaAsc),
    pasadas: clases.filter((c) => esPasada(c, ahora)).sort(porFechaDesc),
    canceladas: clases.filter((c) => c.estado === "CANCELADA").sort(porFechaDesc),
  };
}

// ---------- Alumno ----------

export interface ProfesorDeAlumno {
  profesor: ProfesorResumen;
  clasesTomadas: number;
}

export function resumenAlumno(reservas: readonly ClaseListado[], ahora: Date = new Date()) {
  const { proximas, pasadas } = separarPorFecha(reservas, ahora);

  const profesores = new Map<number, ProfesorDeAlumno>();
  for (const clase of pasadas) {
    if (!clase.profesor) continue;
    const actual = profesores.get(clase.profesor.usuario_id);
    profesores.set(clase.profesor.usuario_id, { profesor: clase.profesor, clasesTomadas: (actual?.clasesTomadas ?? 0) + 1 });
  }

  const horasEntrenadas = pasadas.reduce((total, c) => total + c.duracion_minutos, 0) / 60;

  return {
    proximas,
    pasadas,
    proxima: proximas[0] ?? null,
    horasEntrenadas,
    profesores: [...profesores.values()].sort((a, b) => b.clasesTomadas - a.clasesTomadas),
  };
}

// ---------- Profesor ----------

export interface AlumnoDeProfesor {
  alumno: AlumnoInscripto;
  clases: number;
  proximas: number;
}

/** Todos los alumnos que pasaron por las clases de un profesor, con cuántas clases tomó cada uno. */
export function alumnosDeProfesor(clases: readonly ClaseListado[], ahora: Date = new Date()): AlumnoDeProfesor[] {
  const mapa = new Map<number, AlumnoDeProfesor>();
  for (const clase of clases) {
    if (clase.estado === "CANCELADA") continue;
    const futura = new Date(clase.fecha_hora) >= ahora;
    for (const alumno of clase.alumnos_inscritos ?? []) {
      const actual = mapa.get(alumno.usuario_id) ?? { alumno, clases: 0, proximas: 0 };
      actual.clases += 1;
      if (futura) actual.proximas += 1;
      mapa.set(alumno.usuario_id, actual);
    }
  }
  return [...mapa.values()].sort((a, b) => b.clases - a.clases);
}

/** Ingreso estimado de una clase: precio por persona por inscriptos (en libres, precio individual si va uno solo). */
export function ingresoEstimado(clase: ClaseListado, profesor: ProfesorResumen | null | undefined): number {
  const inscriptos = clase.alumnos_inscritos?.length ?? 0;
  if (!profesor || inscriptos === 0) return 0;
  const grupal = aNumero(profesor.precioClaseGrupal) ?? 0;
  const individual = aNumero(profesor.precioClaseIndividual) ?? 0;
  if (clase.tipo_clase === "LIBRE" && inscriptos === 1) return individual;
  return grupal * inscriptos;
}

export function resumenProfesor(clases: readonly ClaseListado[], profesor: ProfesorResumen | null, ahora: Date = new Date()) {
  const { proximas, pasadas } = separarPorFecha(clases, ahora);
  const lugares = proximas.reduce((t, c) => t + c.capacidad_maxima, 0);
  const ocupados = proximas.reduce((t, c) => t + (c.capacidad_maxima - cuposLibres(c)), 0);

  return {
    proximas,
    pasadas,
    proxima: proximas[0] ?? null,
    inscriptosProximos: ocupados,
    ocupacion: lugares ? Math.round((ocupados / lugares) * 100) : 0,
    ingresosProximos: proximas.reduce((t, c) => t + ingresoEstimado(c, profesor), 0),
    alumnos: alumnosDeProfesor(clases, ahora),
  };
}

// ---------- Admin ----------

export function resumenAdmin(usuarios: readonly UsuarioAdmin[], clases: readonly ClaseListado[], ahora: Date = new Date()) {
  const contar = (rol: UsuarioAdmin["tipoUsuario"]) => usuarios.filter((u) => u.tipoUsuario === rol).length;
  const proximas = clases.filter((c) => esProxima(c, ahora));
  return {
    alumnos: contar("ALUMNO"),
    profesores: contar("PROFESOR"),
    inactivos: usuarios.filter((u) => !u.activo).length,
    clasesProximas: proximas.length,
    reservasActivas: proximas.reduce((t, c) => t + (c.alumnos_inscritos?.length ?? 0), 0),
    clasesCompletas: proximas.filter((c) => estadoVisible(c, ahora) === "completa").length,
    clasesCanceladas: clases.filter((c) => c.estado === "CANCELADA").length,
  };
}
