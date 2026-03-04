import { Genero, Posicion } from "../entities/alumno.entity";
import { ManoDominante } from "src/profesor/entities/profesor.entity";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createAlumnoDto {
    usuario_id: number;
}