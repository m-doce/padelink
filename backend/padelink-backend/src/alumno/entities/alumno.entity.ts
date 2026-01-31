import { Clase } from 'src/clase/entities/clase.entity';
import { ManoDominante } from 'src/profesor/entities/profesor.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Entity, JoinColumn, Column, ManyToMany, OneToOne, PrimaryGeneratedColumn, Decimal128 } from 'typeorm';

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
    @OneToOne(() => Usuario, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'usuarioId'})
    usuarioId: Usuario;

    @Column()
    edad: number;

    @Column()
    nivel: number;

    @Column({type: 'enum', enum: ManoDominante})
    mano_dominante: ManoDominante;

    @Column({type: 'enum', enum: Genero})
    genero: Genero;

    @Column({type: 'enum', enum: Posicion})
    posicion: Posicion;

    @Column({ type: 'decimal', precision: 3, scale: 2 })
    promedio_calificacion: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaCreacion: Date;


}