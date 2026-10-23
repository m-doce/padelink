import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReseniaDto {

  @IsInt()
  @IsNotEmpty()
  profesorId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  calificacion: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comentario?: string;
}
