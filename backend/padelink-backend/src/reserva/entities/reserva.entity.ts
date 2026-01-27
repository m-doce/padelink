import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { EstadoReserva } from "../domain/estado-reserva.enum";

@Entity()
export class Reserva {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fechaHoraInicio: Date;
    
    @Column()
    duracionMinutos: number;

    @Column({
        type: 'enum',
        enum: EstadoReserva,
        default: EstadoReserva.PENDIENTE,
    })
    estado: EstadoReserva;

    @Column()
    profesorId: number;

    @Column()
    alumnoId: number;
}
