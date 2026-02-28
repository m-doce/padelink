import { Injectable } from '@nestjs/common';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profesor } from './entities/profesor.entity';
import { UpdateProfesorDto } from './dto/update-profesor';

@Injectable()
export class ProfesorService {
    constructor(
        @InjectRepository(Profesor)
    private readonly profesorRepository: Repository<Profesor>,
     ) {}
    
    async findAll() {
        return this.profesorRepository.find();
    }

    async create(createProfesorDto: CreateProfesorDto) {
        const profesor = await this.profesorRepository.create(createProfesorDto);
        return this.profesorRepository.save(profesor);
    }

    async findOne(id: number) {
        return this.profesorRepository.findOne({ where: { usuario_id: id } });
    }
    
    async update(id: number, updateProfesorDto: UpdateProfesorDto) {
        return this.profesorRepository.update(id, updateProfesorDto);
    }

    async remove(id: number) {
        return this.profesorRepository.delete(id);
    }
    

}
