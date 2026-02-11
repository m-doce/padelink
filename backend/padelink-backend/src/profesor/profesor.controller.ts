import { ProfesorService } from './profesor.service';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateProfesorDto } from './dto/create-profesor.dto';


@Controller('profesor')
export class ProfesorController {

    constructor(private readonly profesorService: ProfesorService){}

    @Get()
    findall() {
        return this.profesorService.findAll();
    }

    @Post()
    create(@Body() createProfesorDto: CreateProfesorDto) {
        return this.profesorService.create(createProfesorDto);
    }

}