"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface EstadoPedido<T> {
  data: T | null;
  loading: boolean;
  error: string;
  /** Con `silencioso` actualiza los datos sin mostrar el estado de carga (útil tras guardar algo). */
  recargar: (opciones?: { silencioso?: boolean }) => Promise<void>;
}

/**
 * Pide un recurso a la API al montar el componente y expone carga y error.
 * Si `path` es null (por ejemplo, todavía no se sabe el id del usuario) no hace el pedido.
 */
export function useApiGet<T>(path: string | null): EstadoPedido<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [error, setError] = useState("");

  const recargar = useCallback(
    async (opciones?: { silencioso?: boolean }) => {
      if (path === null) return;
      if (!opciones?.silencioso) setLoading(true);
      setError("");
      try {
        setData(await api.get<T>(path));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos");
      } finally {
        setLoading(false);
      }
    },
    [path],
  );

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { data, loading, error, recargar };
}
