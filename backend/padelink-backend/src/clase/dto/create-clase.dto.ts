import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';
import { EstadoEnum } from '../entities/clase.entity';

export class CreateClaseDto {

  @IsInt()
  @IsNotEmpty()
  profesorId: number;

  @IsInt()
  @IsNotEmpty()
  clubId: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_hora: string;

  @IsInt()
  @Min(1)
  duracion_minutos: number;

  @IsInt()
  @Min(1)
  nivel: number;

  @IsInt()
  @Min(1)
  capacidad_maxima: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(EstadoEnum)
  @IsOptional()
  estado?: EstadoEnum;

  @IsOptional()
  alumnosIds?: number[];
}
