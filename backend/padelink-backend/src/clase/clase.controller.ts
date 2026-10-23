import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ClaseService, UsuarioAutenticado } from './clase.service';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../usuario/entities/usuario.entity';

type RequestConUsuario = { user: UsuarioAutenticado };

@Controller('clase')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClaseController {
  constructor(
    private readonly claseService: ClaseService
  ) {}

  // --- Consultas ---
  // Las rutas fijas ('grupales', 'libres', ...) van antes de ':id'
  // para que Nest no las interprete como un id.

  @Get()
  findAll() {
    return this.claseService.findAll();
  }

  @Get('grupales')
  devolverClasesGrupales() {
    return this.claseService.devolverClasesGrupales();
  }

  @Get('libres')
  devolverClasesLibres() {
    return this.claseService.devolverClasesLibres();
  }

  @Get('profesor/:profesorId')
  findByProfesor(@Param('profesorId') profesorId: string) {
    return this.claseService.findByProfesor(+profesorId);
  }

  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId') alumnoId: string) {
    return this.claseService.findByAlumno(+alumnoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.claseService.findOne(+id);
  }

  // --- Gestión de clases (solo profesores y admin) ---

  @Post()
  @Roles(UserRole.PROFESOR, UserRole.ADMIN)
  create(@Body() createClaseDto: CreateClaseDto, @Request() req: RequestConUsuario) {
    // Un profesor solo puede crear clases a su nombre
    if (req.user.role === UserRole.PROFESOR) {
      createClaseDto.profesorId = req.user.id;
    }
    return this.claseService.create(createClaseDto);
  }

  @Patch(':id')
  @Roles(UserRole.PROFESOR, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateClaseDto: UpdateClaseDto, @Request() req: RequestConUsuario) {
    return this.claseService.update(+id, updateClaseDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.PROFESOR, UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: RequestConUsuario) {
    return this.claseService.remove(+id, req.user);
  }

  // --- Reservas ---

  @Post(':id/reservar')
  @Roles(UserRole.ALUMNO)
  reservarClase(@Param('id') id: string, @Request() req: RequestConUsuario) {
    return this.claseService.reservarClase(+id, req.user.id);
  }

  @Post(':id/reserve')
  reserve(@Param('id') id: string, @Body('alumnoId') alumnoId: number, @Request() req: RequestConUsuario) {
    return this.claseService.inscribirAlumno(+id, Number(alumnoId), req.user);
  }

  @Delete(':id/reserve/:alumnoId')
  cancelReserve(@Param('id') id: string, @Param('alumnoId') alumnoId: string, @Request() req: RequestConUsuario) {
    return this.claseService.cancelarInscripcion(+id, +alumnoId, req.user);
  }
}
