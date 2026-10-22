import { Test, TestingModule } from '@nestjs/testing';
import { ReseniaController } from '../../src/resenia/resenia.controller';
import { ReseniaService } from '../../src/resenia/resenia.service';

describe('ReseniaController', () => {
  let controller: ReseniaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReseniaController],
      providers: [ReseniaService],
    }).compile();

    controller = module.get<ReseniaController>(ReseniaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
