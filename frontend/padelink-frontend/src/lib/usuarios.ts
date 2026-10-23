// Filtros de la gestión de usuarios (admin), independientes de la interfaz.
import type { UserRole, UsuarioAdmin } from "@/types";
import { normalizarTexto } from "./format";
import type { OpcionOrden, PredicadoOpcional } from "./filters";

export const NOMBRES_ROL: Record<UserRole, string> = {
  ALUMNO: "Alumno",
  PROFESOR: "Profesor",
  ADMIN: "Administrador",
};

export interface FiltrosUsuario {
  busqueda: string;
  rol: UserRole | "";
  estado: "" | "activo" | "inactivo";
  orden: OrdenUsuario;
}

export const FILTROS_USUARIO_POR_DEFECTO: FiltrosUsuario = { busqueda: "", rol: "", estado: "", orden: "nombre" };

export const porTexto = (texto: string): PredicadoOpcional<UsuarioAdmin> => {
  const buscado = normalizarTexto(texto);
  return !buscado ? null : (u) => normalizarTexto(`${u.nombre} ${u.apellido} ${u.email}`).includes(buscado);
};

export const porRol = (rol: UserRole | ""): PredicadoOpcional<UsuarioAdmin> => (!rol ? null : (u) => u.tipoUsuario === rol);

export const porEstadoCuenta = (estado: FiltrosUsuario["estado"]): PredicadoOpcional<UsuarioAdmin> =>
  !estado ? null : (u) => u.activo === (estado === "activo");

export function predicadosDeUsuario(filtros: FiltrosUsuario): PredicadoOpcional<UsuarioAdmin>[] {
  return [porTexto(filtros.busqueda), porRol(filtros.rol), porEstadoCuenta(filtros.estado)];
}

export const ORDENES_USUARIO = {
  nombre: { etiqueta: "Nombre (A-Z)", comparar: (a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es") },
  recientes: { etiqueta: "Registro más reciente", comparar: (a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime() },
} satisfies Record<string, OpcionOrden<UsuarioAdmin>>;
export type OrdenUsuario = keyof typeof ORDENES_USUARIO;
