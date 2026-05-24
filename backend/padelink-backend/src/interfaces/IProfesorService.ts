import { Profesor } from '../profesor/entities/profesor.entity';
import { UpdateProfesorDto } from '../profesor/dto/update-profesor';

export interface IProfesorService {
    findAll(): Promise<Profesor[]>;
    create(usuario_id: number): Promise<Profesor>;
    findOne(id: number): Promise<Profesor | null>;
    update(id: number, updateProfesorDto: UpdateProfesorDto): Promise<Profesor | null>;
    remove(id: number): Promise<any>;
}
