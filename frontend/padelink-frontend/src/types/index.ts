export type UserRole = 'ALUMNO' | 'PROFESOR';

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

export interface AlumnoProfile {
  fecha_nacimiento: string;
  nivel: string;
  mano_dominante: string;
  genero: string;
  posicion: string;
}

export interface ProfesorProfile {
  usuario_id: number;
  bio?: string;
  descripcion?: string;
  precioClaseIndividual: number;
  anosExperiencia?: number;
  manoDominante?: string;
  linkAjpp?: string;
  promedioCalificacion?: number;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
}

export interface Reserva {
  id: number;
  profesor?: {
    usuario: { nombre: string; apellido: string };
  };
  alumno?: {
    usuario: { nombre: string; apellido: string };
  };
  alumnos_inscritos?: any[]; // To simplify based on existing structure, though could be typed if needed
  club: { nombre: string };
  fecha_hora: string;
  duracion_minutos: number;
  nivel: string;
  estado: string;
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

