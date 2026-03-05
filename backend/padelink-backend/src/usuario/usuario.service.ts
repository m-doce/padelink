import { Injectable } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { UserRole, Usuario } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AlumnoService } from '../alumno/alumno.service';
import { ProfesorService } from '../profesor/profesor.service';


@Injectable()
export class UserService {

    constructor(
        @InjectRepository(Usuario)
        private readonly userRepository: Repository<Usuario>,
        private readonly alumnoService: AlumnoService,
        private readonly profesorService: ProfesorService,
    ) {}

    async findALl(): Promise<Usuario[]> {
        return this.userRepository.find();
    }

    async findOne(id: number): Promise<Usuario | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario | null> {
        await this.userRepository.update(id, updateUsuarioDto);
        return this.userRepository.findOne({where: {id}});
    }

    async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
        try{
            const user = this.userRepository.create(createUsuarioDto);
            const savedUser = await this.userRepository.save(user);
            switch(createUsuarioDto.tipoUsuario) {
                case UserRole.ALUMNO:
                    await this.alumnoService.create(savedUser.id);
                    break;
                case UserRole.PROFESOR:
                    await this.profesorService.create(savedUser.id);
                    break;
            }
            return savedUser;
        } catch (error) {
            throw new Error('Error al crear el usuario');
        }
    }

}
