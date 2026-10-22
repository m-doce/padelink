import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let adminServiceMock: { findAll: jest.Mock };

  beforeEach(async () => {
    adminServiceMock = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: adminServiceMock }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all admins from the service', async () => {
    const admins = [{ usuario_id: 1 }];
    adminServiceMock.findAll.mockResolvedValue(admins);

    await expect(controller.findAll()).resolves.toEqual(admins);
    expect(adminServiceMock.findAll).toHaveBeenCalledTimes(1);
  });
});
