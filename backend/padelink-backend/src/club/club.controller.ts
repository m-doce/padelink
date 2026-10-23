import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateClubDto } from './dto/create-club.dto';
import { ClubService } from './club.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../usuario/entities/usuario.entity';

@Controller('club')
export class ClubController {
  constructor(
    private readonly clubService: ClubService
  ) {}

  @Get()
  findAll() {
    return this.clubService.findAll();
  }

  // Solo profesores (al crear una clase) y administradores pueden dar de alta clubes
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PROFESOR, UserRole.ADMIN)
  createClub(@Body() club: CreateClubDto){
    return this.clubService.create(club);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.clubService.findOne(id);
  }
}
