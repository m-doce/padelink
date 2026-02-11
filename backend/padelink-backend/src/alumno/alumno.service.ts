import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Alumno } from './entities/alumno.entity';
import { Repository } from 'typeorm';
import { createAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class AlumnoService {
    
    constructor(
        @InjectRepository(Alumno)
        private readonly alumnoRepository: Repository<Alumno>,
    ) {}

    async findAll() {
        return this.alumnoRepository.find();
    }
    
    async findOne(id: number) {
        return this.alumnoRepository.findOne({ where: { usuario_id: id } });
    }
    
    async update(id:number, updateAlumnoDto: UpdateAlumnoDto) {
        return this.alumnoRepository.update(id, updateAlumnoDto);
    }
    
}
