import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { PasswordService } from '../usuario/password.service';
import { UserRole } from '../usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(createUsuarioDto: CreateUsuarioDto) {
    if (createUsuarioDto.tipoUsuario === UserRole.ADMIN) {
      throw new ForbiddenException('Las cuentas de administrador no se crean desde el registro público');
    }
    return this.userService.create(createUsuarioDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmailConPassword(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.passwordService.comparePassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Un administrador puede desactivar cuentas desde su panel
    if (user.activo === false) {
      throw new ForbiddenException('Tu cuenta está desactivada. Contactá a un administrador.');
    }

    const payload = { sub: user.id, email: user.email, role: user.tipoUsuario };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        usuario_id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        tipoUsuario: user.tipoUsuario,
      },
    };
  }
}
