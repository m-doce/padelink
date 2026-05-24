import { Entity, PrimaryGeneratedColumn, Column, Timestamp } from "typeorm";

@Entity()
export class Club {


    @PrimaryGeneratedColumn()
    club_id: number;

    @Column({ nullable: true })
    descripcion: string;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    ubicacion: string;

    @Column({ nullable: true })
    ciudad: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;


}