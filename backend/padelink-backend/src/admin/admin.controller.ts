import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../usuario/entities/usuario.entity';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll() {
    return this.adminService.findAllUsers();
  }

  @Get('usuarios/:id')
  findOne(@Param('id') id: string) {
    return this.adminService.findUserDetail(+id);
  }

  @Patch('usuarios/:id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateUser(+id, body);
  }

  @Delete('usuarios/:id')
  remove(@Param('id') id: string, @Request() req: { user: { id: number } }) {
    return this.adminService.removeUser(+id, req.user.id);
  }
}
