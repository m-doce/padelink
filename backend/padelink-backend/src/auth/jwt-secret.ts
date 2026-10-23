import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SECRETO_DESARROLLO = 'padelink-dev-secret-no-usar-en-produccion';

// Devuelve el secreto para firmar los JWT.
// En producción es obligatorio definir JWT_SECRET; en desarrollo se usa uno de prueba con aviso.
export function obtenerJwtSecret(configService: ConfigService): string {
  const secreto = configService.get<string>('JWT_SECRET');
  if (secreto) return secreto;

  if (configService.get<string>('NODE_ENV') === 'production') {
    throw new Error('Falta la variable de entorno JWT_SECRET');
  }

  new Logger('Auth').warn('JWT_SECRET no está definido: se usa un secreto de desarrollo');
  return SECRETO_DESARROLLO;
}
