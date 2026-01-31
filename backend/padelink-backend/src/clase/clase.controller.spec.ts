import { Test, TestingModule } from '@nestjs/testing';
import { ClaseController } from './clase.controller';
import { ClaseService } from './clase.service';

describe('ClaseController', () => {
  let controller: ClaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaseController],
      providers: [ClaseService],
    }).compile();

    controller = module.get<ClaseController>(ClaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
