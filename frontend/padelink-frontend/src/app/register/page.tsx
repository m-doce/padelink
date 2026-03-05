"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserType = "alumno" | "profesor";

type RegisterFormState = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  tipoUsuario: UserType;
};

type FormErrors = Partial<Record<keyof RegisterFormState, string>> & {
  general?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormState>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    tipoUsuario: "alumno",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    field: keyof RegisterFormState,
    value: string | UserType,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function validate(values: RegisterFormState): FormErrors {
    const newErrors: FormErrors = {};

    if (!values.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!values.apellido.trim()) newErrors.apellido = "El apellido es obligatorio";
    
    if (!values.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!values.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio";

    if (!values.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (values.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    return newErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

      const response = await fetch(`${backendUrl}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => undefined);
        const message =
          (errorBody && (errorBody.message as string)) ||
          "No se pudo registrar el usuario";
        setErrors({ general: message });
        return;
      }

      router.push("/login");
    } catch {
      setErrors({
        general:
          "Ocurrió un error al comunicarse con el servidor. Intenta nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Crear cuenta
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Únete a la comunidad de PadeLink
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Nombre
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
              {errors.nombre && <p className="text-xs text-red-600">{errors.nombre}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Apellido
              </label>
              <input
                type="text"
                value={form.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
              {errors.apellido && <p className="text-xs text-red-600">{errors.apellido}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Teléfono
            </label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            {errors.telefono && <p className="text-xs text-red-600">{errors.telefono}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Contraseña
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Soy...
            </span>
            <div className="flex gap-3">
              <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition ${form.tipoUsuario === 'alumno' ? 'border-lime-500 bg-lime-50 text-lime-700 dark:bg-lime-900/20 dark:text-lime-400' : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300'}`}>
                <input
                  type="radio"
                  name="tipoUsuario"
                  value="alumno"
                  checked={form.tipoUsuario === "alumno"}
                  onChange={() => handleChange("tipoUsuario", "alumno")}
                  className="hidden"
                />
                Alumno
              </label>
              <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition ${form.tipoUsuario === 'profesor' ? 'border-lime-500 bg-lime-50 text-lime-700 dark:bg-lime-900/20 dark:text-lime-400' : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300'}`}>
                <input
                  type="radio"
                  name="tipoUsuario"
                  value="profesor"
                  checked={form.tipoUsuario === "profesor"}
                  onChange={() => handleChange("tipoUsuario", "profesor")}
                  className="hidden"
                />
                Profesor
              </label>
            </div>
          </div>

          {errors.general && (
            <p className="text-sm text-red-600 text-center">{errors.general}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-70 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"
          >
            {submitting ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-lime-600 hover:underline dark:text-lime-400">
            Inicia sesión
          </Link>
        </p>
      </main>
    </div>
  );
}