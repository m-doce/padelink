import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn } from 'typeorm';
import { Alumno } from '../../alumno/entities/alumno.entity';
import { Profesor } from '../../profesor/entities/profesor.entity';

// Un alumno puede dejar una sola reseña por profesor
@Entity()
@Unique(['alumno', 'profesor'])
export class Resenia {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alumnoId' })
  alumno: Alumno;

  @ManyToOne(() => Profesor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profesorId' })
  profesor: Profesor;

  // Calificación de 1 a 5
  @Column({ type: 'int' })
  calificacion: number;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;
}
