import { PartialType } from '@nestjs/mapped-types';
import { CreateReseniaDto } from './create-resenia.dto';

export class UpdateReseniaDto extends PartialType(CreateReseniaDto) {}
