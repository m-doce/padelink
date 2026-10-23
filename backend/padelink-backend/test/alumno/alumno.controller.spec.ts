import { Test, TestingModule } from '@nestjs/testing';
import { AlumnoController } from '../../src/alumno/alumno.controller';
import { AlumnoService } from '../../src/alumno/alumno.service';
import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../src/usuario/entities/usuario.entity';

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

  it('should let an alumno update their own profile', async () => {
    const dto = { nivel: 'intermedio' };
    alumnoServiceMock.update.mockResolvedValue({ affected: 1 });

    const req = { user: { id: 1, email: 'a@a.com', role: UserRole.ALUMNO } };
    await expect(controller.update(1, dto, req)).resolves.toEqual({ affected: 1 });
    expect(alumnoServiceMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('should not let an alumno update another profile', () => {
    const req = { user: { id: 2, email: 'b@a.com', role: UserRole.ALUMNO } };
    expect(() => controller.update(1, { nivel: 'avanzado' }, req)).toThrow(ForbiddenException);
    expect(alumnoServiceMock.update).not.toHaveBeenCalled();
  });

  it('should let an admin update any profile', async () => {
    alumnoServiceMock.update.mockResolvedValue({ affected: 1 });
    const req = { user: { id: 99, email: 'admin@a.com', role: UserRole.ADMIN } };
    await expect(controller.update(1, { nivel: 'avanzado' }, req)).resolves.toEqual({ affected: 1 });
  });
});
