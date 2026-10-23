import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReseniaDto } from './dto/create-resenia.dto';
import { UpdateReseniaDto } from './dto/update-resenia.dto';
import { Resenia } from './entities/resenia.entity';
import { Profesor } from '../profesor/entities/profesor.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Clase } from '../clase/entities/clase.entity';
import { UserRole } from '../usuario/entities/usuario.entity';
import type { UsuarioAutenticado } from '../clase/clase.service';

@Injectable()
export class ReseniaService {
  constructor(
    @InjectRepository(Resenia)
    private readonly reseniaRepository: Repository<Resenia>,
    @InjectRepository(Profesor)
    private readonly profesorRepository: Repository<Profesor>,
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,
  ) {}

  async create(createReseniaDto: CreateReseniaDto, alumnoId: number) {
    const { profesorId, calificacion, comentario } = createReseniaDto;

    const profesor = await this.profesorRepository.findOne({ where: { usuario_id: profesorId } });
    if (!profesor) throw new NotFoundException(`Profesor con ID ${profesorId} no encontrado`);

    const alumno = await this.alumnoRepository.findOne({ where: { usuario_id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    // Regla de negocio: solo puede reseñar quien estuvo inscripto en alguna clase del profesor
    const tomoClase = await this.claseRepository.exists({
      where: {
        profesor: { usuario_id: profesorId },
        alumnos_inscritos: { usuario_id: alumnoId },
      },
    });
    if (!tomoClase) {
      throw new ForbiddenException('Solo podés reseñar a profesores con los que tomaste una clase');
    }

    const yaExiste = await this.reseniaRepository.exists({
      where: { profesor: { usuario_id: profesorId }, alumno: { usuario_id: alumnoId } },
    });
    if (yaExiste) {
      throw new ConflictException('Ya dejaste una reseña para este profesor');
    }

    const resenia = this.reseniaRepository.create({ profesor, alumno, calificacion, comentario });
    const guardada = await this.reseniaRepository.save(resenia);
    await this.actualizarPromedio(profesorId);
    return guardada;
  }

  findAll() {
    return this.reseniaRepository.find({
      relations: ['alumno', 'alumno.usuario', 'profesor'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  findByProfesor(profesorId: number) {
    return this.reseniaRepository.find({
      where: { profesor: { usuario_id: profesorId } },
      relations: ['alumno', 'alumno.usuario'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findOne(id: number) {
    const resenia = await this.reseniaRepository.findOne({
      where: { id },
      relations: ['alumno', 'alumno.usuario', 'profesor'],
    });
    if (!resenia) throw new NotFoundException('Reseña no encontrada');
    return resenia;
  }

  async update(id: number, updateReseniaDto: UpdateReseniaDto, usuario: UsuarioAutenticado) {
    const resenia = await this.findOne(id);
    if (resenia.alumno.usuario_id !== usuario.id) {
      throw new ForbiddenException('Solo podés editar tus propias reseñas');
    }

    Object.assign(resenia, updateReseniaDto);
    const guardada = await this.reseniaRepository.save(resenia);
    await this.actualizarPromedio(resenia.profesor.usuario_id);
    return guardada;
  }

  async remove(id: number, usuario: UsuarioAutenticado) {
    const resenia = await this.findOne(id);
    if (usuario.role !== UserRole.ADMIN && resenia.alumno.usuario_id !== usuario.id) {
      throw new ForbiddenException('Solo podés borrar tus propias reseñas');
    }

    await this.reseniaRepository.delete(id);
    await this.actualizarPromedio(resenia.profesor.usuario_id);
    return { deleted: true };
  }

  // Recalcula el promedio de calificaciones que se muestra en el perfil del profesor
  private async actualizarPromedio(profesorId: number) {
    const resultado = await this.reseniaRepository
      .createQueryBuilder('r')
      .select('AVG(r.calificacion)', 'promedio')
      .where('r.profesorId = :profesorId', { profesorId })
      .getRawOne<{ promedio: string | null }>();

    const promedio = resultado?.promedio ? Number(Number(resultado.promedio).toFixed(2)) : 0;
    await this.profesorRepository.update(profesorId, { promedioCalificacion: promedio });
  }
}
