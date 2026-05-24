import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IUsuarioService } from '../interfaces/IUsuarioService';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { PasswordService } from '../usuario/password.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUsuarioService') private readonly userService: IUsuarioService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(createUsuarioDto: CreateUsuarioDto) {
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
