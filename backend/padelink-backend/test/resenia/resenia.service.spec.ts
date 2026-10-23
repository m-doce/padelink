import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReseniaService } from '../../src/resenia/resenia.service';
import { Resenia } from '../../src/resenia/entities/resenia.entity';
import { Profesor } from '../../src/profesor/entities/profesor.entity';
import { Alumno } from '../../src/alumno/entities/alumno.entity';
import { Clase } from '../../src/clase/entities/clase.entity';
import { UserRole } from '../../src/usuario/entities/usuario.entity';

describe('ReseniaService', () => {
  let service: ReseniaService;
  let reseniaRepo: any;
  let profesorRepo: any;
  let alumnoRepo: any;
  let claseRepo: any;

  const alumnoUser = { id: 2, email: 'a@a.com', role: UserRole.ALUMNO };

  beforeEach(async () => {
    reseniaRepo = {
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ id: 1, ...x })),
      exists: jest.fn().mockResolvedValue(false),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ promedio: '4.5' }),
      })),
    };
    profesorRepo = { findOne: jest.fn().mockResolvedValue({ usuario_id: 5 }), update: jest.fn() };
    alumnoRepo = { findOne: jest.fn().mockResolvedValue({ usuario_id: 2 }) };
    claseRepo = { exists: jest.fn().mockResolvedValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReseniaService,
        { provide: getRepositoryToken(Resenia), useValue: reseniaRepo },
        { provide: getRepositoryToken(Profesor), useValue: profesorRepo },
        { provide: getRepositoryToken(Alumno), useValue: alumnoRepo },
        { provide: getRepositoryToken(Clase), useValue: claseRepo },
      ],
    }).compile();

    service = module.get<ReseniaService>(ReseniaService);
  });

  it('crea la reseña y actualiza el promedio del profesor', async () => {
    const result = await service.create({ profesorId: 5, calificacion: 5, comentario: 'Muy bueno' }, 2);

    expect(result.calificacion).toBe(5);
    expect(profesorRepo.update).toHaveBeenCalledWith(5, { promedioCalificacion: 4.5 });
  });

  it('rechaza si el alumno nunca tomó clase con el profesor', async () => {
    claseRepo.exists.mockResolvedValue(false);
    await expect(service.create({ profesorId: 5, calificacion: 4 }, 2)).rejects.toThrow(ForbiddenException);
  });

  it('rechaza una segunda reseña al mismo profesor', async () => {
    reseniaRepo.exists.mockResolvedValue(true);
    await expect(service.create({ profesorId: 5, calificacion: 4 }, 2)).rejects.toThrow(ConflictException);
  });

  it('rechaza si el profesor no existe', async () => {
    profesorRepo.findOne.mockResolvedValue(null);
    await expect(service.create({ profesorId: 99, calificacion: 4 }, 2)).rejects.toThrow(NotFoundException);
  });

  it('no deja editar la reseña de otro alumno', async () => {
    reseniaRepo.findOne.mockResolvedValue({ id: 1, alumno: { usuario_id: 7 }, profesor: { usuario_id: 5 } });
    await expect(service.update(1, { calificacion: 1 }, alumnoUser)).rejects.toThrow(ForbiddenException);
  });

  it('el admin puede borrar cualquier reseña', async () => {
    reseniaRepo.findOne.mockResolvedValue({ id: 1, alumno: { usuario_id: 7 }, profesor: { usuario_id: 5 } });
    await service.remove(1, { id: 1, email: 'admin@a.com', role: UserRole.ADMIN });
    expect(reseniaRepo.delete).toHaveBeenCalledWith(1);
  });
});
