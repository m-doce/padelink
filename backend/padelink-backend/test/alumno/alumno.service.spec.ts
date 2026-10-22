import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Alumno } from '../../src/alumno/entities/alumno.entity';
import { AlumnoService } from '../../src/alumno/alumno.service';

describe('AlumnoService', () => {
  let service: AlumnoService;
  let alumnoRepositoryMock: {
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    alumnoRepositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlumnoService,
        { provide: getRepositoryToken(Alumno), useValue: alumnoRepositoryMock },
      ],
    }).compile();

    service = module.get<AlumnoService>(AlumnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all alumnos', async () => {
    const alumnos = [{ usuario_id: 1 }];
    alumnoRepositoryMock.find.mockResolvedValue(alumnos);

    await expect(service.findAll()).resolves.toEqual(alumnos);
    expect(alumnoRepositoryMock.find).toHaveBeenCalledTimes(1);
  });

  it('should find one alumno by usuario_id', async () => {
    const alumno = { usuario_id: 1 };
    alumnoRepositoryMock.findOne.mockResolvedValue(alumno);

    await expect(service.findOne(1)).resolves.toEqual(alumno);
    expect(alumnoRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { usuario_id: 1 },
    });
  });

  it('should update an alumno', async () => {
    const dto = { nivel: 'avanzado' };
    alumnoRepositoryMock.update.mockResolvedValue({ affected: 1 });

    await expect(service.update(1, dto)).resolves.toEqual({ affected: 1 });
    expect(alumnoRepositoryMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('should create an alumno profile for a usuario', async () => {
    const alumno = { usuario_id: 1 };
    alumnoRepositoryMock.create.mockReturnValue(alumno);
    alumnoRepositoryMock.save.mockResolvedValue(alumno);

    await expect(service.create(1)).resolves.toEqual(alumno);
    expect(alumnoRepositoryMock.create).toHaveBeenCalledWith({ usuario_id: 1 });
    expect(alumnoRepositoryMock.save).toHaveBeenCalledWith(alumno);
  });
});
