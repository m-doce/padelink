import { ManoDominante } from "../entities/profesor.entity";
import { IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';

export class UpdateProfesorDto {

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
    telefono?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    precioClaseIndividual?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    precioClaseGrupal?: number;

    @IsEnum(ManoDominante)
    @IsOptional()
    manoDominante?: ManoDominante;

    @IsString()
    @IsOptional()
    linkAjpp?: string;
}