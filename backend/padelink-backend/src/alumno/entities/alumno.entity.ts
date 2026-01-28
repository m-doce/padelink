import { Clase } from 'src/clase/entities/clase.entity';
import { Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Alumno {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => Clase, (clase) => clase.alumnos_inscritos)
    clases: Clase[];

}