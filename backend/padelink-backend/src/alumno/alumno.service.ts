import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Alumno } from './entities/alumno.entity';
import { Repository } from 'typeorm';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Injectable()
export class AlumnoService {
    
    constructor(
        @InjectRepository(Alumno)
        private readonly alumnoRepository: Repository<Alumno>,
    ) {}

    async findAll(): Promise<Alumno[]> {
        return this.alumnoRepository.find();
    }
    
    async findOne(id: number): Promise<Alumno | null> {
        return this.alumnoRepository.findOne({ where: { usuario_id: id } });
    }
    
    async update(id: number, updateAlumnoDto: UpdateAlumnoDto): Promise<any> {
        return this.alumnoRepository.update(id, updateAlumnoDto);
    }
    
    async create(usuario_id: number): Promise<Alumno> {
        const alumno = this.alumnoRepository.create({
            usuario_id,
        });
        return this.alumnoRepository.save(alumno);
    }
}
