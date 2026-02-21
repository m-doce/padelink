import { Injectable } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';


@Injectable()
export class UserService {

    constructor(
        @InjectRepository(Usuario)
        private readonly userRepository: Repository<Usuario>,
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
        const user = this.userRepository.create(createUsuarioDto);
        return this.userRepository.save(user);
        switch(createUsuarioDto.rol) {
            case 'estudiante':
                return 
        }
    }

}
