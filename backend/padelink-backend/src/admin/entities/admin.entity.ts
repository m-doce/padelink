import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Entity, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Admin {

  @OneToOne(() => Usuario, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'usuarioId'})
  usuarioId: Usuario;
  
}
