import { PartialType } from '@nestjs/mapped-types';
import { CrearReservaDto } from './create-reserva.dto';

export class UpdateReservaDto extends PartialType(CrearReservaDto) {}
