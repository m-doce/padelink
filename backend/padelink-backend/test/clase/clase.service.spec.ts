import { Test, TestingModule } from '@nestjs/testing';
import { ClaseService } from '../../src/clase/clase.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Clase } from '../../src/clase/entities/clase.entity';
import { Alumno } from '../../src/alumno/entities/alumno.entity';
import { ClubService } from '../../src/club/club.service';
import { ProfesorService } from '../../src/profesor/profesor.service';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '../../src/usuario/entities/usuario.entity';
import { EstadoEnum } from '../../src/clase/entities/clase.entity';

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
        { provide: ProfesorService, useValue: profesorServiceMock },
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

  describe('estado de la clase', () => {
    it('pasa a COMPLETA cuando se llena el cupo', async () => {
      const clase: any = { id: 1, alumnos_inscritos: [{ usuario_id: 3 }], capacidad_maxima: 2, estado: EstadoEnum.DISPONIBLE };
      claseRepositoryMock.findOne.mockResolvedValue(clase);
      alumnoRepositoryMock.findOne.mockResolvedValue({ usuario_id: 2 });
      claseRepositoryMock.save.mockImplementation(async (c: any) => c);

      const result = await service.addAlumno(1, 2);
      expect(result.estado).toBe(EstadoEnum.COMPLETA);
    });

    it('vuelve a DISPONIBLE cuando alguien cancela', async () => {
      const clase: any = { id: 1, alumnos_inscritos: [{ usuario_id: 2 }, { usuario_id: 3 }], capacidad_maxima: 2, estado: EstadoEnum.COMPLETA };
      claseRepositoryMock.findOne.mockResolvedValue(clase);
      claseRepositoryMock.save.mockImplementation(async (c: any) => c);

      const result = await service.removeAlumno(1, 2);
      expect(result.estado).toBe(EstadoEnum.DISPONIBLE);
    });
  });

  describe('permisos', () => {
    const profesorDueno = { id: 10, email: 'p@a.com', role: UserRole.PROFESOR };
    const otroProfesor = { id: 11, email: 'o@a.com', role: UserRole.PROFESOR };
    const alumno = { id: 2, email: 'a@a.com', role: UserRole.ALUMNO };

    beforeEach(() => {
      claseRepositoryMock.delete = jest.fn();
      claseRepositoryMock.findOne.mockResolvedValue({
        id: 1, profesor: { usuario_id: 10 }, alumnos_inscritos: [], capacidad_maxima: 4,
      });
    });

    it('el profesor dueño puede borrar su clase', async () => {
      await service.remove(1, profesorDueno);
      expect(claseRepositoryMock.delete).toHaveBeenCalledWith(1);
    });

    it('otro profesor no puede borrar la clase', async () => {
      await expect(service.remove(1, otroProfesor)).rejects.toThrow(ForbiddenException);
    });

    it('un alumno no puede cancelar la reserva de otro alumno', async () => {
      await expect(service.cancelarInscripcion(1, 99, alumno)).rejects.toThrow(ForbiddenException);
    });

    it('un alumno siempre se inscribe a sí mismo aunque mande otro id', async () => {
      alumnoRepositoryMock.findOne.mockResolvedValue({ usuario_id: 2 });
      claseRepositoryMock.save.mockImplementation(async (c: any) => c);

      await service.inscribirAlumno(1, 99, alumno);
      expect(alumnoRepositoryMock.findOne).toHaveBeenCalledWith({ where: { usuario_id: 2 } });
    });
  });
});
