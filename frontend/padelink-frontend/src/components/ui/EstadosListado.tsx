// Estados comunes de cualquier listado: cargando, error y sin resultados.

export function CargandoTarjetas({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
      ))}
    </div>
  );
}

export function MensajeError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
      <p className="text-red-600 dark:text-red-400">{mensaje}</p>
      {onReintentar && (
        <button onClick={onReintentar} className="mt-4 text-sm font-medium underline">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function SinResultados({ mensaje, onLimpiar }: { mensaje: string; onLimpiar?: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
      <p className="text-zinc-500 dark:text-zinc-400">{mensaje}</p>
      {onLimpiar && (
        <button onClick={onLimpiar} className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500">
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
