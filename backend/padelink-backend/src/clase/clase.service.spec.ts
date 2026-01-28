import { Test, TestingModule } from '@nestjs/testing';
import { ClaseService } from './clase.service';

describe('ClaseService', () => {
  let service: ClaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaseService],
    }).compile();

    service = module.get<ClaseService>(ClaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
