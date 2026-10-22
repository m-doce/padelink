import { Test, TestingModule } from '@nestjs/testing';
import { AlumnoController } from '../../src/alumno/alumno.controller';
import { AlumnoService } from '../../src/alumno/alumno.service';

describe('AlumnoController', () => {
  let controller: AlumnoController;
  let alumnoServiceMock: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    alumnoServiceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlumnoController],
      providers: [{ provide: AlumnoService, useValue: alumnoServiceMock }],
    }).compile();

    controller = module.get<AlumnoController>(AlumnoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all alumnos from the service', async () => {
    const alumnos = [{ usuario_id: 1 }];
    alumnoServiceMock.findAll.mockResolvedValue(alumnos);

    await expect(controller.findAll()).resolves.toEqual(alumnos);
    expect(alumnoServiceMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return one alumno by id', async () => {
    const alumno = { usuario_id: 1 };
    alumnoServiceMock.findOne.mockResolvedValue(alumno);

    await expect(controller.findOne(1)).resolves.toEqual(alumno);
    expect(alumnoServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  it('should update an alumno', async () => {
    const dto = { nivel: 'intermedio' };
    alumnoServiceMock.update.mockResolvedValue({ affected: 1 });

    await expect(controller.update(1, dto)).resolves.toEqual({ affected: 1 });
    expect(alumnoServiceMock.update).toHaveBeenCalledWith(1, dto);
  });
});
