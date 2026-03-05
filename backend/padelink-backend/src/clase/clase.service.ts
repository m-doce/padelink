import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { In, Repository } from 'typeorm';
import { ProfesorService } from '../profesor/profesor.service';
import { ClubService } from '../club/club.service';
import { AlumnoService } from '../alumno/alumno.service';
import { Alumno } from '../alumno/entities/alumno.entity';

@Injectable()
export class ClaseService {
  
  constructor(
    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    private readonly profesorService: ProfesorService,
    private readonly clubService: ClubService,
  ) {}

  async create(createClaseDto: CreateClaseDto) {
    const { profesorId, clubId, alumnosIds, ...datosClase } = createClaseDto;

    // 1. Verificar y obtener el Profesor
    const profesor = await this.profesorService.findOne(profesorId);
    if (!profesor) {
      throw new NotFoundException(`Profesor con ID ${profesorId} no encontrado`);
    }

    // 2. Verificar y obtener el Club
    const club = await this.clubService.findOne(clubId);
    if (!club) {
      throw new NotFoundException(`Club con ID ${clubId} no encontrado`);
    }

    // 3. Obtener los Alumnos si se proporcionaron IDs
    let alumnos: Alumno[] = [];
    if (alumnosIds && alumnosIds.length > 0) {
      alumnos = await this.alumnoRepository.find({
        where: { usuario_id: In(alumnosIds) }
      });
    }

    // 4. Crear la clase con las relaciones
    const nuevaClase = this.claseRepository.create({
      ...datosClase,
      profesor: profesor,
      club: club,
      alumnos_inscritos: alumnos
    });

    return this.claseRepository.save(nuevaClase);
  }
  
  async findAll() {
    return this.claseRepository.find();
  }

  async findOne(id: number) {
    return this.claseRepository.findOne({ where: { id } });
  }

  async findByAlumno(alumnoId: number) {
    return this.claseRepository.find({
      where: {
        alumnos_inscritos: {
          usuario_id: alumnoId
        }
      },
      relations: ['profesor', 'club', 'profesor.usuario']
    });
  }

  async remove(id: number) {
    return this.claseRepository.delete(id);
  }

  async update(id:number, updateClaseDto: UpdateClaseDto) {
    return this.claseRepository.update(id, updateClaseDto);
  }

}