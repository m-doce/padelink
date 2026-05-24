import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../usuario/dto/update-usuario.dto';

export interface IUsuarioService {
    findALl(): Promise<Usuario[]>;
    findOne(id: number): Promise<Usuario | null>;
    findByEmail(email: string): Promise<Usuario | null>;
    update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario | null>;
    create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario>;
}
