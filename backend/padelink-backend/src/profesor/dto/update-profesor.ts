import { ManoDominante } from "../entities/profesor.entity";

export class UpdateProfesorDto {
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    telefono?: string;
    bio?: string;
    precioPorClase?: string;
    manoDominante?: ManoDominante;
    linkAjpp?: string;
}