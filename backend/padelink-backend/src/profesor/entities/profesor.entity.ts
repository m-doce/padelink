import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';

export enum ManoDominante {
  diestro = 'diestro',
  zurdo = 'zurdo',
}

@Entity()
export class Profesor {

  @PrimaryColumn()
  usuario_id: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precioClaseIndividual: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precioClaseGrupal: number;


  @Column({ type: 'enum', enum: ManoDominante, nullable: true })
  manoDominante: ManoDominante;

  @Column({ length: 255, nullable: true })
  linkAjpp: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, nullable: true })
  promedioCalificacion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}
