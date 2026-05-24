import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profesor } from './entities/profesor.entity';
import { UpdateProfesorDto } from './dto/update-profesor';
import { Usuario } from '../usuario/entities/usuario.entity';
import { IProfesorService } from '../interfaces/IProfesorService';

@Injectable()
export class ProfesorService implements IProfesorService {
    constructor(
        @InjectRepository(Profesor)
        private readonly profesorRepository: Repository<Profesor>,
        @InjectRepository(Usuario)
        private readonly userRepository: Repository<Usuario>,
    ) {}
    
    async findAll() {
        return this.profesorRepository.find({ relations: ['usuario'] });
    }

    async create(usuario_id: number) {
        const profesor = this.profesorRepository.create({
            usuario_id,
        });
        return this.profesorRepository.save(profesor);
    }

    async findOne(id: number) {
        return this.profesorRepository.findOne({ 
            where: { usuario_id: id }, 
            relations: ['usuario'] 
        });
    }
    
    async update(id: number, updateProfesorDto: UpdateProfesorDto) {
        const { nombre, apellido, email, telefono, ...profesorData } = updateProfesorDto;

        const userUpdate = {
            ...(nombre && { nombre }),
            ...(apellido && { apellido }),
            ...(email && { email }),
            ...(telefono && { telefono })
        };

        if (Object.keys(userUpdate).length > 0) {
            await this.userRepository.update(id, userUpdate);
        }

        if ((profesorData as any).usuario) {
            delete (profesorData as any).usuario;
        }

        if (Object.keys(profesorData).length > 0) {
            await this.profesorRepository.update(id, profesorData);
        }

        return this.findOne(id);
    }

    async remove(id: number) {
        return this.profesorRepository.delete(id);
    }
}
