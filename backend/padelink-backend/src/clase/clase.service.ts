import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Clase, EstadoEnum, TipoEnum } from './entities/clase.entity';
import { In, Repository } from 'typeorm';
import { ProfesorService } from '../profesor/profesor.service';
import { ClubService } from '../club/club.service';
import { Alumno } from '../alumno/entities/alumno.entity';
import { UserRole } from '../usuario/entities/usuario.entity';
import type { UsuarioAutenticado } from '../auth/propietario';

export type { UsuarioAutenticado } from '../auth/propietario';

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
    const { profesorId, clubId, alumnosIds } = createClaseDto;
    if (!profesorId) {
      throw new BadRequestException('Falta indicar el profesor de la clase');
    }

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
      fecha_hora: new Date(createClaseDto.fecha_hora),
      duracion_minutos: createClaseDto.duracion_minutos,
      nivel: createClaseDto.nivel,
      capacidad_maxima: createClaseDto.tipo_clase === TipoEnum.LIBRE
      ? 4 // LIMITE FIJO PARA LAS CLASES LIBRES
      : createClaseDto.capacidad_maxima,
      descripcion: createClaseDto.descripcion,
      tipo_clase: createClaseDto.tipo_clase,
      estado: EstadoEnum.DISPONIBLE, //Siempre arranca en disponible
      profesor: profesor,
      club: club,
      alumnos_inscritos: alumnos
    });

    return this.claseRepository.save(nuevaClase);
  }

  // Un profesor solo puede gestionar sus propias clases; el admin puede gestionar todas.
  private verificarPermisoSobreClase(clase: Clase, usuario: UsuarioAutenticado): void {
    if (usuario.role === UserRole.ADMIN) return;
    if (usuario.role === UserRole.PROFESOR && clase.profesor?.usuario_id === usuario.id) return;
    throw new ForbiddenException('No tenés permiso para gestionar esta clase');
  }

  private async buscarClaseConRelaciones(id: number): Promise<Clase> {
    const clase = await this.claseRepository.findOne({
      where: { id },
      relations: ['profesor', 'alumnos_inscritos'],
    });
    if (!clase) throw new NotFoundException('Clase no encontrada');
    return clase;
  }

  async reservarClase(claseId: number, usuarioId: number) {
    return this.addAlumno(claseId, usuarioId);
  }

  // Inscripción vía POST /clase/:id/reserve.
  // Un alumno solo puede inscribirse a sí mismo; un profesor solo en sus clases.
  async inscribirAlumno(claseId: number, alumnoId: number, usuario: UsuarioAutenticado) {
    if (usuario.role === UserRole.ALUMNO) {
      return this.addAlumno(claseId, usuario.id);
    }
    const clase = await this.buscarClaseConRelaciones(claseId);
    this.verificarPermisoSobreClase(clase, usuario);
    return this.addAlumno(claseId, alumnoId);
  }

  // Cancelación de una inscripción.
  // Un alumno solo puede cancelar la suya; un profesor solo en sus clases.
  async cancelarInscripcion(claseId: number, alumnoId: number, usuario: UsuarioAutenticado) {
    if (usuario.role === UserRole.ALUMNO) {
      if (alumnoId !== usuario.id) {
        throw new ForbiddenException('Solo podés cancelar tus propias reservas');
      }
    } else {
      const clase = await this.buscarClaseConRelaciones(claseId);
      this.verificarPermisoSobreClase(clase, usuario);
    }
    return this.removeAlumno(claseId, alumnoId);
  }

  async findAll() {
    return this.claseRepository.find({
      relations: ['profesor', 'profesor.usuario', 'alumnos_inscritos', 'club'],
      order: { fecha_hora: 'ASC' },
    });
  }

  async findOne(id: number) {
    const clase = await this.claseRepository.findOne({
      where: { id },
      relations: ['profesor', 'profesor.usuario', 'alumnos_inscritos', 'alumnos_inscritos.usuario', 'club']
    });
    if (!clase) throw new NotFoundException('Clase no encontrada');
    return clase;
  }

  async findByProfesor(profesorId: number) {
    return this.claseRepository.find({
      where: {
        profesor: {
          usuario_id: profesorId
        }
      },
      relations: ['alumnos_inscritos', 'alumnos_inscritos.usuario', 'club'],
      order: { fecha_hora: 'ASC' }
    });
  }

  async findByAlumno(alumnoId: number) {
    return this.claseRepository.find({
      where: {
        alumnos_inscritos: {
          usuario_id: alumnoId
        }
      },
      relations: ['profesor', 'profesor.usuario', 'club'],
      order: { fecha_hora: 'ASC' },
    });
  }

  async remove(id: number, usuario: UsuarioAutenticado) {
    const clase = await this.buscarClaseConRelaciones(id);
    this.verificarPermisoSobreClase(clase, usuario);
    return this.claseRepository.delete(id);
  }

  async update(id: number, updateClaseDto: UpdateClaseDto, usuario: UsuarioAutenticado) {
    const clase = await this.buscarClaseConRelaciones(id);
    this.verificarPermisoSobreClase(clase, usuario);

    // El profesor dueño y los alumnos inscriptos no se cambian desde acá
    const { profesorId, alumnosIds, clubId, ...datos } = updateClaseDto;

    const cambios: Partial<Clase> = { ...datos } as Partial<Clase>;
    if (datos.fecha_hora) {
      cambios.fecha_hora = new Date(datos.fecha_hora);
    }
    if (clubId) {
      const club = await this.clubService.findOne(clubId);
      if (!club) throw new NotFoundException(`Club con ID ${clubId} no encontrado`);
      cambios.club = club;
    }

    await this.claseRepository.save({ ...clase, ...cambios });
    return this.findOne(id);
  }

  async addAlumno(id: number, alumnoId: number) {
    const clase = await this.claseRepository.findOne({ where: { id }, relations: ['alumnos_inscritos'] });
    if (!clase) throw new NotFoundException('Clase no encontrada');

    const alumno = await this.alumnoRepository.findOne({ where: { usuario_id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    if (clase.estado === EstadoEnum.CANCELADA) {
      throw new BadRequestException('La clase está cancelada');
    }

    if (clase.alumnos_inscritos.some(a => a.usuario_id === alumnoId)) {
      throw new ConflictException('El alumno ya está inscrito en esta clase');
    }

    if (clase.alumnos_inscritos.length >= clase.capacidad_maxima) {
      throw new BadRequestException('La clase está llena');
    }

    clase.alumnos_inscritos.push(alumno);
    if (clase.alumnos_inscritos.length >= clase.capacidad_maxima) {
      clase.estado = EstadoEnum.COMPLETA;
    }
    return this.claseRepository.save(clase);
  }

  async removeAlumno(id: number, alumnoId: number) {
    const clase = await this.claseRepository.findOne({ where: { id }, relations: ['alumnos_inscritos'] });
    if (!clase) throw new NotFoundException('Clase no encontrada');

    clase.alumnos_inscritos = clase.alumnos_inscritos.filter(a => a.usuario_id !== alumnoId);
    // Si se liberó un lugar, la clase vuelve a estar disponible
    if (clase.estado === EstadoEnum.COMPLETA && clase.alumnos_inscritos.length < clase.capacidad_maxima) {
      clase.estado = EstadoEnum.DISPONIBLE;
    }
    return this.claseRepository.save(clase);
  }

  async devolverClasesGrupales(){
    return this.claseRepository.find({
      where: {
        tipo_clase: TipoEnum.GRUPAL
      },
      relations: ['profesor', 'profesor.usuario', 'alumnos_inscritos', 'club']
    });
  }

  async devolverClasesLibres(){
    return this.claseRepository.find({
      where: {
        tipo_clase: TipoEnum.LIBRE
      },
      relations: ['profesor', 'profesor.usuario', 'alumnos_inscritos', 'club']
    });
  }
}
