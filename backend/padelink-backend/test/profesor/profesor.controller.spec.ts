import { Test, TestingModule } from '@nestjs/testing';
import { ProfesorController } from '../../src/profesor/profesor.controller';
import { ProfesorService } from '../../src/profesor/profesor.service';

describe('ProfesorController', () => {
  let controller: ProfesorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfesorController],
      providers: [
        { provide: ProfesorService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ProfesorController>(ProfesorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
