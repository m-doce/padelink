import { Injectable } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';

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

}
