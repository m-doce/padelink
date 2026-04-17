import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Timestamp, JoinTable, ManyToMany } from 'typeorm';
import { Profesor } from '../../profesor/entities/profesor.entity';
import { Club} from '../../club/entities/club.entity'
import { Alumno } from '../../alumno/entities/alumno.entity';

export enum EstadoEnum {
    DISPONIBLE = 'DISPONIBLE',
    CANCELADA = 'CANCELADA',
    COMPLETA = 'COMPLETA',
}

export enum TipoEnum {
    CERRADA = 'CERRADA',
    GRUPAL = 'GRUPAL',
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
    fecha_hora: Date;

    @Column({ nullable: false })
    duracion_minutos: number;       

    @Column({ type: 'varchar' , nullable: true})
    nivel: string;

    @Column()
    capacidad_maxima: number;

    @Column({ nullable: true })
    descripcion?: string;

    @ManyToMany(() => Alumno)
    @JoinTable()
    alumnos_inscritos: Alumno[];

    @Column({ type: 'enum', enum: TipoEnum, default: TipoEnum.GRUPAL })
    tipo_clase: TipoEnum;

    @Column({ type: 'enum', enum: EstadoEnum, default: EstadoEnum.DISPONIBLE })
    estado: EstadoEnum;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;
}
