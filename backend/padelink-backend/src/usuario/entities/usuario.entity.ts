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

 @Column({ unique: true })
 email: string;

 // No se incluye en las consultas por defecto: así el hash nunca viaja en las respuestas de la API.
 // Solo el login lo pide explícitamente (ver UserService.findByEmailConPassword).
 @Column({ select: false })
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
