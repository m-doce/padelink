import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ClaseService } from './clase.service';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('clase')
@UseGuards(AuthGuard('jwt'))
export class ClaseController {
  constructor(private readonly claseService: ClaseService) {}

  @Post()
  create(@Body() createClaseDto: CreateClaseDto) {
    return this.claseService.create(createClaseDto);
  }

  @Post(':id/reservar')
  async reservarClase(
    @Param('id') id: string,
    @Request() req
  ) {
    const usuarioId = req.user.id; 
    return this.claseService.reservarClase(+id, usuarioId);
  }

  @Get()
  findAll() {
    return this.claseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.claseService.findOne(+id);
  }

  @Get('profesor/:profesorId')
  findByProfesor(@Param('profesorId') profesorId: string) {
    return this.claseService.findByProfesor(+profesorId);
  }

  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId') alumnoId: string) {
    return this.claseService.findByAlumno(+alumnoId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClaseDto: UpdateClaseDto) {
    return this.claseService.update(+id, updateClaseDto);
  }

  @Post(':id/reserve')
  reserve(@Param('id') id: string, @Body('alumnoId') alumnoId: number) {
    return this.claseService.addAlumno(+id, alumnoId);
  }

  @Delete(':id/reserve/:alumnoId')
  cancelReserve(@Param('id') id: string, @Param('alumnoId') alumnoId: string) {
    return this.claseService.removeAlumno(+id, +alumnoId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.claseService.remove(+id);
  }
}
