import { Clase } from 'src/clase/entities/clase.entity';
import { ManoDominante } from 'src/profesor/entities/profesor.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Entity, JoinColumn, Column, OneToOne, PrimaryColumn } from 'typeorm';

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export enum Posicion{
    DRIVE = 'DRIVE',
    REVES = 'REVES',
}
@Entity()
export class Alumno {

    @PrimaryColumn()
    usuario_id: number;

    @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column({ nullable: true })
    edad: number;

    @Column({ nullable: true })
    nivel: number;

    @Column({ type: 'enum', enum: ManoDominante, nullable: true })
    mano_dominante: ManoDominante;

    @Column({ type: 'enum', enum: Genero, nullable: true })
    genero: Genero;

    @Column({ type: 'enum', enum: Posicion, nullable: true })
    posicion: Posicion;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    promedio_calificacion: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaCreacion: Date;
}