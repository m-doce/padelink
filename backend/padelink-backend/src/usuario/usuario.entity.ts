import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Usuario {
 @PrimaryGeneratedColumn()
 id: number;
 
 @Column()
 nombreUsuario: string;

 @Column ({ unique : true})
 email: string;

 @Column()
 password: string;

 @Column()
 tipoUsuario: string;
}
