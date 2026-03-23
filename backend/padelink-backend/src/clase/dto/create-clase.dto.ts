import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';
import { TipoEnum } from '../entities/clase.entity';
import { EstadoEnum } from '../entities/clase.entity';

export class CreateClaseDto {

  @IsInt()
  @IsNotEmpty()
  profesorId: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_hora: string;

  @IsInt()
  @Min(1)
  duracion_minutos: number;

  @IsString()
  @IsNotEmpty()
  nivel: string;

  @IsInt()
  @Min(1)
  capacidad_maxima: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(TipoEnum)
  @IsOptional()
  tipo_clase?: TipoEnum;

  @IsEnum(EstadoEnum)
  @IsOptional()
  estado?: EstadoEnum;

  @IsOptional()
  alumnosIds?: number[];
}
