import { Injectable } from '@nestjs/common';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profesor } from './entities/profesor.entity';

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
    
    

}
