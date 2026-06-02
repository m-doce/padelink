import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(
    private readonly adminService: AdminService
  ) {}

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

}
