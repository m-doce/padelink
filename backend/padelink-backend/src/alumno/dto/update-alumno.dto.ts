import { PartialType } from '@nestjs/mapped-types';
import { createAlumnoDto } from './create-alumno.dto';
import { ManoDominante } from '../../profesor/entities/profesor.entity';
import { Genero } from '../entities/alumno.entity';
import { Posicion } from '../entities/alumno.entity';
import { IsNumber, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateAlumnoDto  {
    @IsNumber()
    @IsOptional()
    usuario_id?: number;

    @IsString()
    @IsOptional()
    fecha_nacimiento?: string;

    @IsNumber()
    @IsOptional()
    edad?: number;

    @IsString()
    @IsOptional()
    nivel?: string;

    @IsEnum(ManoDominante)
    @IsOptional()
    mano_dominante?: ManoDominante;

    @IsEnum(Genero)
    @IsOptional()
    genero?: Genero;

    @IsEnum(Posicion)
    @IsOptional()
    posicion?: Posicion;
}