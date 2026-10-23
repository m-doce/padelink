// Motor genérico de filtrado y orden.
//
// Cada filtro es una función pura (un "predicado") que decide si un elemento pasa o no.
// Para agregar un filtro nuevo se agrega un predicado; no hace falta tocar este motor
// ni las pantallas que lo usan (principio abierto/cerrado).

export type Predicado<T> = (item: T) => boolean;
export type Comparador<T> = (a: T, b: T) => number;

/** Un predicado "inactivo" se representa con null y simplemente no se aplica. */
export type PredicadoOpcional<T> = Predicado<T> | null;

export function aplicarFiltros<T>(items: readonly T[], predicados: readonly PredicadoOpcional<T>[]): T[] {
  const activos = predicados.filter((p): p is Predicado<T> => p !== null);
  return items.filter((item) => activos.every((p) => p(item)));
}

export interface OpcionOrden<T> {
  etiqueta: string;
  comparar: Comparador<T>;
}

export function ordenar<T>(items: readonly T[], comparador: Comparador<T>): T[] {
  return [...items].sort(comparador);
}

/** Cuenta cuántos filtros difieren de su valor por defecto (para mostrar "Filtros (3)"). */
export function contarFiltrosActivos<F extends object>(filtros: F, porDefecto: F, ignorar: (keyof F)[] = []): number {
  return (Object.keys(filtros) as (keyof F)[]).filter((clave) => {
    if (ignorar.includes(clave)) return false;
    const actual = filtros[clave];
    const base = porDefecto[clave];
    if (Array.isArray(actual) && Array.isArray(base)) return actual.length !== base.length;
    return actual !== base;
  }).length;
}

/** Valores únicos y ordenados de una lista, para armar las opciones de un select. */
export function valoresUnicos<T>(items: readonly T[], obtener: (item: T) => string | null | undefined): string[] {
  const valores = new Set<string>();
  for (const item of items) {
    const v = obtener(item);
    if (v) valores.add(v);
  }
  return [...valores].sort((a, b) => a.localeCompare(b, "es"));
}
