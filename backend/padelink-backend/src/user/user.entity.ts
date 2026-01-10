import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
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
