import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profesor } from './entities/profesor.entity';
import { UpdateProfesorDto } from './dto/update-profesor';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class ProfesorService {
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

        // Actualizar datos del Usuario si se proporcionan
        if (nombre || apellido || email || telefono) {
            const userUpdate: any = {};
            if (nombre) userUpdate.nombre = nombre;
            if (apellido) userUpdate.apellido = apellido;
            if (email) userUpdate.email = email;
            if (telefono) userUpdate.telefono = telefono;

            await this.userRepository.update(id, userUpdate);
        }

        // Eliminar 'usuario' del profesorData si existe para evitar errores en el update del profesor
        if ((profesorData as any).usuario) {
            delete (profesorData as any).usuario;
        }

        // Actualizar datos del Profesor
        if (Object.keys(profesorData).length > 0) {
            await this.profesorRepository.update(id, profesorData);
        }

        return this.findOne(id);
    }

    async remove(id: number) {
        return this.profesorRepository.delete(id);
    }
}
