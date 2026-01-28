import { Usuario } from 'src/usuario/usuario.entity';
import { Entity, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryColumn()
  usuarioId: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}
