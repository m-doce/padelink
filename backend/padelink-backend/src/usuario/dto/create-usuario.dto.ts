import { UserRole } from "../entities/usuario.entity";

export class CreateUsuarioDto {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono: string;
    tipoUsuario: UserRole;
}