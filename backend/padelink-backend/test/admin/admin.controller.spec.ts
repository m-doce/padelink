import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let adminServiceMock: { findAllUsers: jest.Mock; removeUser: jest.Mock };

  beforeEach(async () => {
    adminServiceMock = {
      findAllUsers: jest.fn(),
      removeUser: jest.fn(),
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

  it('should return all users from the service', async () => {
    const users = [{ id: 1, email: 'a@a.com' }];
    adminServiceMock.findAllUsers.mockResolvedValue(users);

    await expect(controller.findAll()).resolves.toEqual(users);
    expect(adminServiceMock.findAllUsers).toHaveBeenCalledTimes(1);
  });

  it('should pass the requesting admin id when removing a user', async () => {
    await controller.remove('5', { user: { id: 1 } });
    expect(adminServiceMock.removeUser).toHaveBeenCalledWith(5, 1);
  });
});
