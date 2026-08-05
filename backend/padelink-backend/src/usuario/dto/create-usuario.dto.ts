import { UserRole } from "../entities/usuario.entity";
import { IsString, IsEmail, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateUsuarioDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    telefono: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    tipoUsuario: UserRole;
}