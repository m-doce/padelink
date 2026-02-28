"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

      // Assuming standard NestJS AuthController path
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      // Here you would typically save the token
      // const data = await response.json();
      // localStorage.setItem('token', data.access_token);

      router.push("/");
    } catch (err) {
      setError("Email o contraseña incorrectos");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Bienvenido de nuevo a PadeLink
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Contraseña
              </label>
              {/* Optional: Forgot password link */}
            </div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-70 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"
          >
            {submitting ? "Iniciando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-lime-600 hover:underline dark:text-lime-400">
            Regístrate aquí
          </Link>
        </p>
      </main>
    </div>
  );
}