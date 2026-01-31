"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UserType = "alumno" | "profesor";

type RegisterFormState = {
  nombreUsuario: string;
  email: string;
  password: string;
  tipoUsuario: UserType;
};

type FormErrors = Partial<Record<keyof RegisterFormState, string>> & {
  general?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormState>({
    nombreUsuario: "",
    email: "",
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

    if (!values.nombreUsuario.trim()) {
      newErrors.nombreUsuario = "El nombre es obligatorio";
    }

    if (!values.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!values.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (values.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!values.tipoUsuario) {
      newErrors.tipoUsuario = "Debes seleccionar un tipo de usuario";
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

      router.push("/");
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Crear cuenta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="nombreUsuario"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Nombre de usuario
            </label>
            <input
              id="nombreUsuario"
              type="text"
              value={form.nombreUsuario}
              onChange={(event) =>
                handleChange("nombreUsuario", event.target.value)
              }
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              autoComplete="username"
            />
            {errors.nombreUsuario && (
              <p className="text-xs text-red-600">{errors.nombreUsuario}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) =>
                handleChange("password", event.target.value)
              }
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Tipo de usuario
            </span>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 transition hover:border-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-400">
                <input
                  type="radio"
                  name="tipoUsuario"
                  value="alumno"
                  checked={form.tipoUsuario === "alumno"}
                  onChange={() => handleChange("tipoUsuario", "alumno")}
                  className="h-4 w-4"
                />
                Alumno
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 transition hover:border-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-400">
                <input
                  type="radio"
                  name="tipoUsuario"
                  value="profesor"
                  checked={form.tipoUsuario === "profesor"}
                  onChange={() => handleChange("tipoUsuario", "profesor")}
                  className="h-4 w-4"
                />
                Profesor
              </label>
            </div>
            {errors.tipoUsuario && (
              <p className="text-xs text-red-600">{errors.tipoUsuario}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-sm text-red-600">{errors.general}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center rounded-md bg-zinc-900 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>
      </main>
    </div>
  );
}