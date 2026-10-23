import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../usuario/entities/usuario.entity';

// Datos del usuario que vienen del token JWT (ver JwtStrategy.validate)
export interface UsuarioAutenticado {
  id: number;
  email: string;
  role: UserRole;
}

/**
 * Regla común de autorización sobre un recurso que pertenece a un usuario:
 * solo puede modificarlo su dueño o un administrador.
 */
export function verificarPropietarioOAdmin(usuario: UsuarioAutenticado, idDuenio: number, mensaje = 'No tenés permiso para modificar este perfil'): void {
  if (usuario.role === UserRole.ADMIN) return;
  if (usuario.id === Number(idDuenio)) return;
  throw new ForbiddenException(mensaje);
}
