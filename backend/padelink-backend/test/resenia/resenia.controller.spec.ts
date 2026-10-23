import { Test, TestingModule } from '@nestjs/testing';
import { ReseniaController } from '../../src/resenia/resenia.controller';
import { ReseniaService } from '../../src/resenia/resenia.service';
import { UserRole } from '../../src/usuario/entities/usuario.entity';

describe('ReseniaController', () => {
  let controller: ReseniaController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = { create: jest.fn(), findByProfesor: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReseniaController],
      providers: [{ provide: ReseniaService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ReseniaController>(ReseniaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create usa el id del alumno logueado, no uno enviado en el body', async () => {
    const dto = { profesorId: 5, calificacion: 4 };
    await controller.create(dto, { user: { id: 9, email: 'a@a.com', role: UserRole.ALUMNO } });
    expect(serviceMock.create).toHaveBeenCalledWith(dto, 9);
  });
});
