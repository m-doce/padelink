import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './usuario.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario, UserRole } from './entities/usuario.entity';
import { PasswordService } from './password.service';
import { RegistrationService } from './registration.service';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepositoryMock: any;
  let passwordServiceMock: any;
  let registrationServiceMock: any;

  beforeEach(async () => {
    userRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    passwordServiceMock = {
      hashPassword: jest.fn().mockResolvedValue('hashed_password'),
    };

    registrationServiceMock = {
      registerProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(Usuario), useValue: userRepositoryMock },
        { provide: PasswordService, useValue: passwordServiceMock },
        { provide: RegistrationService, useValue: registrationServiceMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create an Alumno successfully', async () => {
      const dto: any = { password: 'pass', tipoUsuario: UserRole.ALUMNO };
      const savedUser = { id: 1, ...dto, password: 'hashed_password' };
      userRepositoryMock.create.mockReturnValue(savedUser);
      userRepositoryMock.save.mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(result).toEqual(savedUser);
      expect(registrationServiceMock.registerProfile).toHaveBeenCalledWith(1, UserRole.ALUMNO);
    });

    it('should create a Profesor successfully', async () => {
      const dto: any = { password: 'pass', tipoUsuario: UserRole.PROFESOR };
      const savedUser = { id: 2, ...dto, password: 'hashed_password' };
      userRepositoryMock.create.mockReturnValue(savedUser);
      userRepositoryMock.save.mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(result).toEqual(savedUser);
      expect(registrationServiceMock.registerProfile).toHaveBeenCalledWith(2, UserRole.PROFESOR);
    });

    it('should handle duplicate email or other creation errors by throwing BadRequestException', async () => {
      const dto: any = { password: 'pass', tipoUsuario: UserRole.ALUMNO };
      userRepositoryMock.create.mockReturnValue(dto);
      userRepositoryMock.save.mockRejectedValue(new Error('Duplicate entry'));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
