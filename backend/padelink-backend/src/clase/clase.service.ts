import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { In, Repository } from 'typeorm';
import { ProfesorService } from '../profesor/profesor.service';
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
  ) {}

  async create(createClaseDto: CreateClaseDto) {
    const { profesorId, alumnosIds, ...datosClase } = createClaseDto;

    // 1. Verificar y obtener el Profesor
    const profesor = await this.profesorService.findOne(profesorId);
    if (!profesor) {
      throw new NotFoundException(`Profesor con ID ${profesorId} no encontrado`);
    }

    // 2. Obtener los Alumnos si se proporcionaron IDs
    let alumnos: Alumno[] = [];
    if (alumnosIds && alumnosIds.length > 0) {
      alumnos = await this.alumnoRepository.find({
        where: { usuario_id: In(alumnosIds) }
      });
    }

    // 3. Crear la clase con las relaciones
    const nuevaClase = this.claseRepository.create({
      ...datosClase,
      profesor: profesor,
      alumnos_inscritos: alumnos
    });

    return this.claseRepository.save(nuevaClase);
  }
  
  async findAll() {
    return this.claseRepository.find();
  }

  async findOne(id: number) {
    return this.claseRepository.findOne({ 
      where: { id },
      relations: ['profesor', 'profesor.usuario', 'alumnos_inscritos']
    });
  }

  async findByProfesor(profesorId: number) {
    return this.claseRepository.find({
      where: {
        profesor: {
          usuario_id: profesorId
        }
      },
      relations: ['alumnos_inscritos']
    });
  }

  async findByAlumno(alumnoId: number) {
    return this.claseRepository.find({
      where: {
        alumnos_inscritos: {
          usuario_id: alumnoId
        }
      },
      relations: ['profesor', 'profesor.usuario']
    });
  }

  async remove(id: number) {
    return this.claseRepository.delete(id);
  }

  async update(id:number, updateClaseDto: UpdateClaseDto) {
    return this.claseRepository.update(id, updateClaseDto);
  }

  async addAlumno(id: number, alumnoId: number) {
    const clase = await this.claseRepository.findOne({ where: { id }, relations: ['alumnos_inscritos'] });
    if (!clase) throw new NotFoundException('Clase no encontrada');
    
    const alumno = await this.alumnoRepository.findOne({ where: { usuario_id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    if (clase.alumnos_inscritos.some(a => a.usuario_id === alumnoId)) {
      throw new Error('El alumno ya está inscrito en esta clase');
    }

    if (clase.alumnos_inscritos.length >= clase.capacidad_maxima) {
      throw new Error('La clase está llena');
    }

    clase.alumnos_inscritos.push(alumno);
    return this.claseRepository.save(clase);
  }

  async removeAlumno(id: number, alumnoId: number) {
    const clase = await this.claseRepository.findOne({ where: { id }, relations: ['alumnos_inscritos'] });
    if (!clase) throw new NotFoundException('Clase no encontrada');

    clase.alumnos_inscritos = clase.alumnos_inscritos.filter(a => a.usuario_id !== alumnoId);
    return this.claseRepository.save(clase);
  }
}