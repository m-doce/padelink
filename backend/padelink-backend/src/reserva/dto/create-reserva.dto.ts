import { EstadoReserva } from '../domain/estado-reserva.enum';
import { IsEnum } from 'class-validator';

export class CrearReservaDto {
  @IsEnum(EstadoReserva)
  estado: EstadoReserva;
}
