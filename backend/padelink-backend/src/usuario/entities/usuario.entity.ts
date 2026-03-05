import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  ALUMNO = 'ALUMNO',
  PROFESOR = 'PROFESOR',
  ADMIN = 'ADMIN',
}


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

 @Column({
    type: 'enum',
    enum: UserRole,
 })
 tipoUsuario: UserRole;

 @Column({default: () => 'CURRENT_TIMESTAMP'})
 fecha_registro: Date;

}
