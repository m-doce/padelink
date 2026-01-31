import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Usuario {
 @PrimaryGeneratedColumn()
 id: number;
 
 @Column({default: true})
 activo: boolean;

 @Column()
 email: string;

 @Column()
 password: string;

 @Column()
 nombre: string;

 @Column()
 apellido: string;

 @Column()
 telefono: string;

 @Column()
 tipoUsuario: string;

 @Column({default: () => 'CURRENT_TIMESTAMP'})
 fecha_registro: Date;

}
