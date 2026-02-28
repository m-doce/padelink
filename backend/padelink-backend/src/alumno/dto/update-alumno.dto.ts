import { PartialType } from '@nestjs/mapped-types';
import { createAlumnoDto } from './create-alumno.dto';

export class UpdateAlumnoDto extends PartialType(createAlumnoDto) {
  
}