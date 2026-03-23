import { PartialType } from '@nestjs/mapped-types';
import { createAlumnoDto } from './create-alumno.dto';
import { ManoDominante } from 'src/profesor/entities/profesor.entity';
import { Genero } from '../entities/alumno.entity';
import { Posicion } from '../entities/alumno.entity';

export class UpdateAlumnoDto  {
    usuario_id: number;
    fecha_nacimiento?: string;
    edad?: number;
    nivel?: string;
    mano_dominante?: ManoDominante;
    genero?: Genero;
    posicion?: Posicion;
}