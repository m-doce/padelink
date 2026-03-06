import { ProfesorService } from './profesor.service';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor';
import { AuthGuard } from '@nestjs/passport';


@Controller('profesor')
@UseGuards(AuthGuard('jwt'))
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
    
    @Patch(':id')
    update(@Param('id') id: number, @Body() updateProfesorDto: UpdateProfesorDto) {
        return this.profesorService.update(id, updateProfesorDto);
    }
    
    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.profesorService.remove(id);
    }
    
}