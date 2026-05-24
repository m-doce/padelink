import { ManoDominante } from "../entities/profesor.entity";
import { IsNumber, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateProfesorDto {
    @IsNumber()
    @IsOptional()
    usuario_id?: number;

    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    @IsOptional()
    apellido?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsNumber()
    @IsOptional()
    precioClaseIndividual?: number;

    @IsEnum(ManoDominante)
    @IsOptional()
    manoDominante?: ManoDominante;

    @IsString()
    @IsOptional()
    linkAjpp?: string;
}