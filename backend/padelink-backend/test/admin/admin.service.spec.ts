import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Admin } from '../../src/admin/entities/admin.entity';
import { AdminService } from '../../src/admin/admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepositoryMock: { find: jest.Mock };

  beforeEach(async () => {
    adminRepositoryMock = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Admin), useValue: adminRepositoryMock },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all admins from the repository', async () => {
    const admins = [{ usuario_id: 1 }];
    adminRepositoryMock.find.mockResolvedValue(admins);

    await expect(service.findAll()).resolves.toEqual(admins);
    expect(adminRepositoryMock.find).toHaveBeenCalledTimes(1);
  });
});
