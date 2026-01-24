import { Test, TestingModule } from '@nestjs/testing';
import { ReseniaService } from './resenia.service';

describe('ReseniaService', () => {
  let service: ReseniaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReseniaService],
    }).compile();

    service = module.get<ReseniaService>(ReseniaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
