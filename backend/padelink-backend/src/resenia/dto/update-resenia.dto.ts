import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReseniaDto } from './create-resenia.dto';

// Se puede cambiar la calificación y el comentario, pero no el profesor reseñado
export class UpdateReseniaDto extends PartialType(OmitType(CreateReseniaDto, ['profesorId'] as const)) {}
