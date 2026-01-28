import { Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Alumno {
    @PrimaryGeneratedColumn()
    id: number;
}