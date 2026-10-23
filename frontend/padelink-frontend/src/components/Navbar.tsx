"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Modal from "./Modal";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

interface Enlace {
  href: string;
  etiqueta: string;
  /** Se muestra como botón (por ejemplo, "Registrarse"). */
  destacado?: boolean;
}

const SECCIONES: Enlace[] = [
  { href: "/professors", etiqueta: "Profesores" },
  { href: "/", etiqueta: "Clases Grupales" },
  { href: "/libres", etiqueta: "Clases Libres" },
];

export const PANEL_POR_ROL: Record<UserRole, string> = {
  ADMIN: "/admin",
  PROFESOR: "/dashboard/professor",
  ALUMNO: "/dashboard/student",
};

/**
 * Qué secciones públicas ve cada rol. Profesores y administradores trabajan solo
 * desde su panel, así que no ven el marketplace de clases y profesores.
 */
function seccionesPara(rol: UserRole | null): Enlace[] {
  return rol === "PROFESOR" || rol === "ADMIN" ? [] : SECCIONES;
}

/** Links que dependen de la sesión. Escritorio y celular usan esta misma lista. */
function enlacesDeSesion(rol: UserRole | null): Enlace[] {
  if (rol) return [{ href: PANEL_POR_ROL[rol], etiqueta: "Mi Panel" }];
  return [
    { href: "/login", etiqueta: "Iniciar Sesión" },
    { href: "/register", etiqueta: "Registrarse", destacado: true },
  ];
}

const esActiva = (href: string, pathname: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export default function Navbar() {
  const pathname = usePathname();
  // La sesión se lee del contexto: es la única fuente de verdad para toda la app
  const { user, isLoggedIn, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const rol = user?.tipoUsuario ?? null;
  const enlaces = [...seccionesPara(rol), ...enlacesDeSesion(rol)];
  // Para profesores y admins, el logo lleva a su panel en lugar del marketplace
  const inicio = rol === "PROFESOR" || rol === "ADMIN" ? PANEL_POR_ROL[rol] : "/";

  // En celular, el menú se cierra con Escape
  useEffect(() => {
    if (!menuAbierto) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && setMenuAbierto(false);
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [menuAbierto]);

  const cerrarMenu = () => setMenuAbierto(false);

  const pedirCerrarSesion = () => {
    cerrarMenu();
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout("/");
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-12">
          <Link href={inicio} onClick={cerrarMenu} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400">
              <span className="font-bold text-zinc-900">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight">PadeLink</span>
          </Link>

          {/* Escritorio */}
          <nav aria-label="Principal" className="hidden items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex">
            {enlaces.map((e) => {
              const activa = esActiva(e.href, pathname);
              return (
                <Link
                  key={e.href}
                  href={e.href}
                  aria-current={activa ? "page" : undefined}
                  className={
                    e.destacado
                      ? "rounded-full bg-zinc-900 px-4 py-2 text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"
                      : `transition-colors hover:text-lime-600 dark:hover:text-lime-400 ${activa ? "text-zinc-900 dark:text-white" : ""}`
                  }
                >
                  {e.etiqueta}
                </Link>
              );
            })}
            {isLoggedIn && (
              <button onClick={pedirCerrarSesion} className="font-medium text-red-600 hover:text-red-700">
                Cerrar Sesión
              </button>
            )}
          </nav>

          {/* Botón del menú en celular */}
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            className="-mr-2 rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              {menuAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menú en celular */}
        {menuAbierto && (
          <nav id="menu-movil" aria-label="Principal" className="border-t border-zinc-200 px-4 pb-4 pt-2 dark:border-zinc-800 md:hidden">
            <ul className="space-y-1">
              {enlaces.map((e) => {
                const activa = esActiva(e.href, pathname);
                return (
                  <li key={e.href}>
                    <Link
                      href={e.href}
                      onClick={cerrarMenu}
                      aria-current={activa ? "page" : undefined}
                      className={
                        e.destacado
                          ? "mt-2 block rounded-xl bg-zinc-900 px-3 py-3 text-center font-semibold text-white dark:bg-lime-400 dark:text-zinc-900"
                          : `block rounded-xl px-3 py-3 font-medium ${
                              activa
                                ? "bg-lime-50 text-lime-700 dark:bg-lime-900/20 dark:text-lime-400"
                                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }`
                      }
                    >
                      {e.etiqueta}
                    </Link>
                  </li>
                );
              })}
              {isLoggedIn && (
                <li>
                  <button
                    onClick={pedirCerrarSesion}
                    className="block w-full rounded-xl px-3 py-3 text-left font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Cerrar Sesión
                  </button>
                </li>
              )}
            </ul>
          </nav>
        )}
      </header>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Cerrar Sesión"
        description="¿Estás seguro de que deseas cerrar sesión?"
        confirmLabel="Cerrar Sesión"
        cancelLabel="Cancelar"
        variant="primary"
      />
    </>
  );
}
