import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Timestamp } from 'typeorm';
import { Profesor } from '../../profesor/profesor.entity';
import { Club} from '../../club/entities/club.entity'
import { Alumno } from '../../alumno/entities/alumno.entity';

export enum EstadoEnum {
    DISPONIBLE = 'DISPONIBLE',
    CANCELADA = 'CANCELADA',
    COMPLETA = 'COMPLETA',
}

@Entity()
export class Clase {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Profesor)
    @JoinColumn({ name: 'profesorId'})
    profesor: Profesor;

    @ManyToOne(() => Club)
    @JoinColumn({ name: 'clubId'})
    club: Club;

    @Column({ nullable: false })
    fecha_hora: Timestamp;

    @Column({ nullable: false })
    duracion_minutos: number;       

    @Column()
    nivel: number;

    @Column()
    capacidad_maxima: number;

    @Column()
    descripcion: string;

    @Column()
    alumnos_inscritos: Alumno[];
    
    @Column()
    estado: EstadoEnum;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Timestamp;
}
