import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { AlumnoService } from './alumno.service';
import { createAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Controller('alumno')
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
    
    @Put(':id')
    update(@Param('id') id: number, @Body() updateAlumnoDto: UpdateAlumnoDto) {
        return this.alumnoService.update(id, updateAlumnoDto);
    }
}
    
