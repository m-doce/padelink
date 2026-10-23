"use client";

import { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import { User, LoginResponse } from "../types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (data: LoginResponse) => void;
  /** Cierra la sesión y redirige (por defecto al login). */
  logout: (destino?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Hydration safe initialization
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      // localStorage solo existe en el navegador: se lee después de montar para no romper la hidratación
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsInitialized(true);
  }, []);

  const login = useCallback((data: LoginResponse) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback((destino = "/login") => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push(destino);
  }, [router]);

  // Si la API responde 401 (token vencido o inválido), se cierra la sesión
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("api-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("api-unauthorized", handleUnauthorized);
  }, [logout]);

  if (!isInitialized) return null; // Or a loading spinner to prevent hydration mismatch

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
