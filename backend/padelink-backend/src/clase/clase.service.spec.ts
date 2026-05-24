import { Test, TestingModule } from '@nestjs/testing';
import { ClaseService } from './clase.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { ClubService } from '../club/club.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('ClaseService', () => {
  let service: ClaseService;
  let claseRepositoryMock: any;
  let alumnoRepositoryMock: any;
  let profesorServiceMock: any;
  let clubServiceMock: any;

  beforeEach(async () => {
    claseRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    alumnoRepositoryMock = {
      findOne: jest.fn(),
    };

    profesorServiceMock = {
      findOne: jest.fn(),
    };

    clubServiceMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaseService,
        { provide: getRepositoryToken(Clase), useValue: claseRepositoryMock },
        { provide: getRepositoryToken(Alumno), useValue: alumnoRepositoryMock },
        { provide: 'IProfesorService', useValue: profesorServiceMock },
        { provide: ClubService, useValue: clubServiceMock },
      ],
    }).compile();

    service = module.get<ClaseService>(ClaseService);
  });

  describe('addAlumno', () => {
    it('should enroll an alumno successfully', async () => {
      const clase: any = { id: 1, alumnos_inscritos: [], capacidad_maxima: 4 };
      const alumno: any = { usuario_id: 2 };
      claseRepositoryMock.findOne.mockResolvedValue(clase);
      alumnoRepositoryMock.findOne.mockResolvedValue(alumno);
      claseRepositoryMock.save.mockResolvedValue({ ...clase, alumnos_inscritos: [alumno] });

      const result = await service.addAlumno(1, 2);

      expect(result.alumnos_inscritos).toHaveLength(1);
      expect(result.alumnos_inscritos[0].usuario_id).toBe(2);
    });

    it('should throw ConflictException if already enrolled', async () => {
      const alumno: any = { usuario_id: 2 };
      const clase: any = { id: 1, alumnos_inscritos: [alumno], capacidad_maxima: 4 };
      claseRepositoryMock.findOne.mockResolvedValue(clase);
      alumnoRepositoryMock.findOne.mockResolvedValue(alumno);

      await expect(service.addAlumno(1, 2)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if class is full', async () => {
      const clase: any = { id: 1, alumnos_inscritos: [{ usuario_id: 3 }, { usuario_id: 4 }], capacidad_maxima: 2 };
      const alumno: any = { usuario_id: 2 };
      claseRepositoryMock.findOne.mockResolvedValue(clase);
      alumnoRepositoryMock.findOne.mockResolvedValue(alumno);

      await expect(service.addAlumno(1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent class', async () => {
      claseRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.addAlumno(999, 2)).rejects.toThrow(NotFoundException);
    });
  });
});
