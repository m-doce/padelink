import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProfesorService } from './profesor.service';
import { UpdateProfesorDto } from './dto/update-profesor';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../usuario/entities/usuario.entity';
import { verificarPropietarioOAdmin, type UsuarioAutenticado } from '../auth/propietario';

@Controller('profesor')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProfesorController {

    constructor(private readonly profesorService: ProfesorService){}

    @Get()
    findAll() {
        return this.profesorService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.profesorService.findOne(id);
    }

    // Cada profesor edita solo su propio perfil (el admin puede editar cualquiera)
    @Patch(':id')
    update(@Param('id') id: number, @Body() updateProfesorDto: UpdateProfesorDto, @Request() req: { user: UsuarioAutenticado }) {
        verificarPropietarioOAdmin(req.user, id);
        return this.profesorService.update(id, updateProfesorDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: number) {
        return this.profesorService.remove(id);
    }
}
