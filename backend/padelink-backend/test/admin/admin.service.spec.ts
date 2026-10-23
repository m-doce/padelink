import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Admin } from '../../src/admin/entities/admin.entity';
import { AdminService } from '../../src/admin/admin.service';
import { Usuario } from '../../src/usuario/entities/usuario.entity';
import { Alumno } from '../../src/alumno/entities/alumno.entity';
import { Profesor } from '../../src/profesor/entities/profesor.entity';
import { Clase } from '../../src/clase/entities/clase.entity';

describe('AdminService', () => {
  let service: AdminService;
  let userRepositoryMock: { find: jest.Mock; findOne: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    userRepositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Admin), useValue: {} },
        { provide: getRepositoryToken(Usuario), useValue: userRepositoryMock },
        { provide: getRepositoryToken(Alumno), useValue: {} },
        { provide: getRepositoryToken(Profesor), useValue: {} },
        { provide: getRepositoryToken(Clase), useValue: {} },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users without their password', async () => {
    userRepositoryMock.find.mockResolvedValue([{ id: 1, email: 'a@a.com', password: 'hash' }]);

    const result = await service.findAllUsers();

    expect(result).toEqual([{ id: 1, email: 'a@a.com' }]);
  });

  it('should not allow an admin to delete their own account', async () => {
    await expect(service.removeUser(1, 1)).rejects.toThrow(BadRequestException);
    expect(userRepositoryMock.remove).not.toHaveBeenCalled();
  });
});
