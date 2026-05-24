import { Injectable, BadRequestException } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { UserRole, Usuario } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { PasswordService } from './password.service';
import { RegistrationService } from './registration.service';
import { IUsuarioService } from '../interfaces/IUsuarioService';

@Injectable()
export class UserService implements IUsuarioService {

    constructor(
        @InjectRepository(Usuario)
        private readonly userRepository: Repository<Usuario>,
        private readonly passwordService: PasswordService,
        private readonly registrationService: RegistrationService,
    ) {}

    async findALl(): Promise<Usuario[]> {
        return this.userRepository.find();
    }

    async findOne(id: number): Promise<Usuario | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario | null> {
        if (updateUsuarioDto.password) {
            updateUsuarioDto.password = await this.passwordService.hashPassword(updateUsuarioDto.password);
        }
        await this.userRepository.update(id, updateUsuarioDto);
        return this.userRepository.findOne({where: {id}});
    }

    async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
        try{
            const hashedPassword = await this.passwordService.hashPassword(createUsuarioDto.password);
            const user = this.userRepository.create({
                ...createUsuarioDto,
                password: hashedPassword,
            });
            const savedUser = await this.userRepository.save(user);
            await this.registrationService.registerProfile(savedUser.id, createUsuarioDto.tipoUsuario);
            return savedUser;
        } catch (error) {
            throw new BadRequestException('Error al crear el usuario');
        }
    }

}
