import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../guards/roles.guard';
import { UserRole } from '../../usuario/entities/usuario.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
