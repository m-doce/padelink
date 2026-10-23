import { Controller, Body, Get, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { AlumnoService } from './alumno.service';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { AuthGuard } from '@nestjs/passport';
import { verificarPropietarioOAdmin, type UsuarioAutenticado } from '../auth/propietario';

@Controller('alumno')
@UseGuards(AuthGuard('jwt'))
export class AlumnoController {
    constructor(
        private readonly alumnoService: AlumnoService,
    ) {}

    @Get()
    findAll() {
        return this.alumnoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.alumnoService.findOne(id);
    }

    // Cada alumno edita solo su propio perfil (el admin puede editar cualquiera)
    @Patch(':id')
    update(@Param('id') id: number, @Body() updateAlumnoDto: UpdateAlumnoDto, @Request() req: { user: UsuarioAutenticado }) {
        verificarPropietarioOAdmin(req.user, id);
        return this.alumnoService.update(id, updateAlumnoDto);
    }
}
