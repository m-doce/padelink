"use client";

import { useCallback, useMemo, useState } from "react";
import { aplicarFiltros, contarFiltrosActivos, ordenar, type OpcionOrden, type PredicadoOpcional } from "@/lib/filters";

interface Opciones<T, F extends { orden: string }> {
  items: readonly T[];
  porDefecto: F;
  /** Traduce el estado de los filtros a predicados (ver lib/clases.ts y lib/profesores.ts). */
  predicados: (filtros: F) => PredicadoOpcional<T>[];
  ordenes: Record<F["orden"], OpcionOrden<T>>;
}

/**
 * Estado genérico de filtros + resultado filtrado y ordenado.
 * Sirve para cualquier listado: la pantalla solo define qué filtros tiene.
 */
export function useFiltros<T, F extends { orden: string }>({ items, porDefecto, predicados, ordenes }: Opciones<T, F>) {
  const [filtros, setFiltros] = useState<F>(porDefecto);

  const cambiar = useCallback(<K extends keyof F>(clave: K, valor: F[K]) => {
    setFiltros((actual) => ({ ...actual, [clave]: valor }));
  }, []);

  /** Para filtros de selección múltiple (chips): agrega o quita un valor. */
  const alternar = useCallback(<K extends keyof F>(clave: K, valor: F[K] extends (infer V)[] ? V : never) => {
    setFiltros((actual) => {
      const lista = actual[clave] as unknown[];
      const nueva = lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
      return { ...actual, [clave]: nueva };
    });
  }, []);

  const limpiar = useCallback(() => setFiltros(porDefecto), [porDefecto]);

  const resultados = useMemo(() => {
    const filtrados = aplicarFiltros(items, predicados(filtros));
    const orden = ordenes[filtros.orden as F["orden"]];
    return orden ? ordenar(filtrados, orden.comparar) : filtrados;
  }, [items, filtros, predicados, ordenes]);

  const activos = useMemo(
    () => contarFiltrosActivos(filtros, porDefecto, ["orden"] as (keyof F)[]),
    [filtros, porDefecto],
  );

  return { filtros, cambiar, alternar, limpiar, resultados, activos };
}
