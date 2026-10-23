export type UserRole = 'ALUMNO' | 'PROFESOR' | 'ADMIN';

export interface User {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  tipoUsuario: UserRole;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Un alumno recién registrado tiene estos datos vacíos hasta que completa su perfil
export interface AlumnoProfile {
  fecha_nacimiento: string | null;
  nivel: string | null;
  mano_dominante: string | null;
  genero: string | null;
  posicion: string | null;
}

export interface Club {
  id?: number;
  club_id?: number;
  nombre: string;
  direccion?: string;
  ubicacion?: string;
  ciudad?: string;
}

export interface Clase {
  id: number;
  fecha_hora: string;
  duracion_minutos: number;
  nivel: string;
  capacidad_maxima: number;
  alumnos_inscritos: Array<{ usuario_id: number; usuario: { nombre: string; apellido: string; email: string } }>;
  estado: string;
  descripcion?: string;
  club?: Club;
  profesor?: {
    usuario_id?: number;
    usuario: { nombre: string; apellido: string };
    precioClaseIndividual?: number;
  };
}

// --- Listados públicos de clases y profesores ---

export type TipoClase = 'GRUPAL' | 'LIBRE';
export type EstadoClase = 'DISPONIBLE' | 'CANCELADA' | 'COMPLETA';
// Los precios llegan como string desde las columnas decimal de PostgreSQL
export type Monto = number | string | null | undefined;

export interface ProfesorResumen {
  usuario_id: number;
  usuario: { nombre: string; apellido: string; email?: string };
  bio?: string | null;
  precioClaseGrupal?: Monto;
  precioClaseIndividual?: Monto;
  manoDominante?: string | null;
  linkAjpp?: string | null;
  promedioCalificacion?: Monto;
}

export interface ClubResumen {
  club_id?: number;
  nombre: string;
  ubicacion?: string | null;
  ciudad?: string | null;
}

export interface ClaseListado {
  id: number;
  fecha_hora: string;
  duracion_minutos: number;
  nivel?: string | null;
  capacidad_maxima: number;
  descripcion?: string | null;
  tipo_clase: TipoClase;
  estado: EstadoClase;
  club?: ClubResumen | null;
  profesor?: ProfesorResumen;
  alumnos_inscritos?: AlumnoInscripto[];
}

export interface AlumnoInscripto {
  usuario_id: number;
  nivel?: string | null;
  posicion?: string | null;
  usuario?: { nombre: string; apellido: string; email: string; telefono?: string };
}

/** Usuario tal como lo devuelve el panel de administración (sin contraseña). */
export interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoUsuario: UserRole;
  activo: boolean;
  fecha_registro: string;
}

export interface Resenia {
  id: number;
  calificacion: number;
  comentario?: string | null;
  fecha_creacion: string;
  alumno: {
    usuario_id: number;
    usuario?: { nombre: string; apellido: string };
  };
}

export interface Profesor {
  usuario_id: number;
  usuario: User;
  bio: string;
  precioClaseIndividual: number | string;
  manoDominante: "diestro" | "zurdo" | string;
  linkAjpp?: string;
  promedioCalificacion: number | string;
  imageUrl?: string;
  club?: Club;
}

