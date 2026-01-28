import { Entity, PrimaryGeneratedColumn, Column, Timestamp } from "typeorm";

@Entity()
export class Club {

    @PrimaryGeneratedColumn()
    club_id: number;

    @Column()
    descripcion: string;

    @Column()
    nombre: string;

    @Column()
    ubicacion: string;

    @Column()
    ciudad: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Timestamp;

}