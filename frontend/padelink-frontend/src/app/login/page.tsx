"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const data: any = await api.post("/auth/login", form);

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.dispatchEvent(new Event('auth-change'));
        
        toast.success("¡Bienvenido de nuevo!", {
          description: `Sesión iniciada como ${data.user.nombre}`,
        });
        
        const dashboardPath = data.user.tipoUsuario === 'PROFESOR' 
          ? '/dashboard/professor' 
          : '/dashboard/student';
        
        router.push(dashboardPath);
      }
    } catch (err: any) {
      toast.error("Error al iniciar sesión", {
        description: err.message || "Email o contraseña incorrectos",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-lime-50/20 to-zinc-50 dark:from-black dark:via-lime-900/10 dark:to-black p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl" />
      </div>
      
      <main className="relative w-full max-w-md">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-500 rounded-2xl mb-4 shadow-lg shadow-lime-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            PadeLink
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Tu plataforma de clases de pádel
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 p-8 border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Iniciar Sesión
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Ingresá tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-lime-500 hover:bg-lime-600 text-white font-medium rounded-lg shadow-lg shadow-lime-500/30 hover:shadow-lime-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-lime-600 hover:text-lime-700 dark:text-lime-400 dark:hover:text-lime-300 transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}