import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReseniaService } from './resenia.service';
import { CreateReseniaDto } from './dto/create-resenia.dto';
import { UpdateReseniaDto } from './dto/update-resenia.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../usuario/entities/usuario.entity';
import type { UsuarioAutenticado } from '../clase/clase.service';

type RequestConUsuario = { user: UsuarioAutenticado };

@Controller('resenia')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReseniaController {
  constructor(
    private readonly reseniaService: ReseniaService
  ) {}

  @Post()
  @Roles(UserRole.ALUMNO)
  create(@Body() createReseniaDto: CreateReseniaDto, @Request() req: RequestConUsuario) {
    return this.reseniaService.create(createReseniaDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.reseniaService.findAll();
  }

  @Get('profesor/:profesorId')
  findByProfesor(@Param('profesorId') profesorId: string) {
    return this.reseniaService.findByProfesor(+profesorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reseniaService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ALUMNO)
  update(@Param('id') id: string, @Body() updateReseniaDto: UpdateReseniaDto, @Request() req: RequestConUsuario) {
    return this.reseniaService.update(+id, updateReseniaDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ALUMNO, UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: RequestConUsuario) {
    return this.reseniaService.remove(+id, req.user);
  }
}
