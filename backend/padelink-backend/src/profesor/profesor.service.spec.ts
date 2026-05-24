import { Test, TestingModule } from '@nestjs/testing';
import { ProfesorService } from './profesor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profesor } from './entities/profesor.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

describe('ProfesorService', () => {
  let service: ProfesorService;
  let profesorRepositoryMock: any;
  let userRepositoryMock: any;

  beforeEach(async () => {
    profesorRepositoryMock = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    userRepositoryMock = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfesorService,
        { provide: getRepositoryToken(Profesor), useValue: profesorRepositoryMock },
        { provide: getRepositoryToken(Usuario), useValue: userRepositoryMock },
      ],
    }).compile();

    service = module.get<ProfesorService>(ProfesorService);
  });

  describe('update', () => {
    it('should update profile and return updated professor', async () => {
      const dto = { nombre: 'Juan', telefono: '123' };
      const updatedProfesor = { usuario_id: 1, usuario: { nombre: 'Juan', telefono: '123' } };
      
      userRepositoryMock.update.mockResolvedValue(undefined);
      profesorRepositoryMock.update.mockResolvedValue(undefined);
      profesorRepositoryMock.findOne.mockResolvedValue(updatedProfesor);

      const result = await service.update(1, dto);

      expect(userRepositoryMock.update).toHaveBeenCalledWith(1, { nombre: 'Juan', telefono: '123' });
      expect(result).toEqual(updatedProfesor);
    });

    it('should return null if professor not found after update', async () => {
      const dto = { linkAjpp: 'http://test.com' };
      
      profesorRepositoryMock.update.mockResolvedValue(undefined);
      profesorRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.update(1, dto);

      expect(profesorRepositoryMock.update).toHaveBeenCalledWith(1, { linkAjpp: 'http://test.com' });
      expect(result).toBeNull();
    });
  });
});
