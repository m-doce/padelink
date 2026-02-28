import { Genero, Posicion } from "../entities/alumno.entity";
import { ManoDominante } from "src/profesor/entities/profesor.entity";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createAlumnoDto {
  // Datos de Usuario
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
  @IsOptional()
  @IsString()
  telefono?: string;

  // Datos de Alumno
  @IsNumber()
  @IsNotEmpty()
  edad: number;
  @IsNumber()
  @IsNotEmpty()
  nivel: number;
  @IsNotEmpty()
  mano_dominante: ManoDominante;
  @IsNotEmpty()
  genero: Genero;
  @IsNotEmpty()
  posicion: Posicion;
}