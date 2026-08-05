import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateClubDto {
    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsString()
    @IsOptional()
    ubicacion?: string;

    @IsString()
    @IsOptional()
    ciudad?: string;

    @IsNumber()
    @IsOptional()
    numero_canchas?: number;
}