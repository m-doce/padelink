import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">Iniciar Sesión</h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">Próximamente...</p>
        <Link href="/" className="text-lime-600 hover:underline">Volver al inicio</Link>
      </div>
    </div>
  );
}
