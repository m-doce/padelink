import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

export enum ManoDominante {
  diestro = 'diestro',
  zurdo = 'zurdo',
}

@Entity()
export class Profesor {
 
  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuarioId: Usuario;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioPorClase: string;

  @Column({ type: 'enum', enum: ManoDominante })
  manoDominante: ManoDominante;

  @Column({ length: 255, nullable: true })
  linkAjpp: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  promedioCalificacion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}
