import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../src/usuario/usuario.service';
import { PasswordService } from '../../src/usuario/password.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../src/usuario/entities/usuario.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioServiceMock: any;
  let jwtServiceMock: any;
  let passwordServiceMock: any;

  beforeEach(async () => {
    usuarioServiceMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtServiceMock = {
      signAsync: jest.fn(),
    };

    passwordServiceMock = {
      comparePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: usuarioServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: PasswordService, useValue: passwordServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      usuarioServiceMock.findByEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'test@test.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usuarioServiceMock.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hash' });
      passwordServiceMock.comparePassword.mockResolvedValue(false);
      await expect(service.login({ email: 'test@test.com', password: 'wrongpassword' })).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user on successful login', async () => {
      const user = { id: 1, nombre: 'Test', apellido: 'User', email: 'test@test.com', password: 'hash', tipoUsuario: UserRole.ALUMNO };
      usuarioServiceMock.findByEmail.mockResolvedValue(user);
      passwordServiceMock.comparePassword.mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue('test_token');

      const result = await service.login({ email: 'test@test.com', password: 'password' });

      expect(result).toEqual({
        access_token: 'test_token',
        user: {
          usuario_id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          tipoUsuario: user.tipoUsuario,
        },
      });
    });
  });
});
