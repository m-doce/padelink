"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"ALUMNO" | "PROFESOR" | null>(null);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      setIsLoggedIn(true);
      setUserRole(user.tipoUsuario);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole(null);
    router.push("/");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 lg:px-12 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-lime-400 flex items-center justify-center">
          <span className="font-bold text-zinc-900">P</span>
        </div>
        <span className="text-xl font-bold tracking-tight">PadeLink</span>
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        <Link href="/professors" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
          Profesores
        </Link>
        
        {isLoggedIn ? (
          <>
            <Link 
              href={userRole === "PROFESOR" ? "/dashboard/professor" : "/dashboard/student"} 
              className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
            >
              Mi Panel
            </Link>
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-zinc-900 px-4 py-2 text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"
            >
              Registrarse
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
