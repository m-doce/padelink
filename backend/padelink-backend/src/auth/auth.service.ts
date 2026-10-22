import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';
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
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.passwordService.comparePassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
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
