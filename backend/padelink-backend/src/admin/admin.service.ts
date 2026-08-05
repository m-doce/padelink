import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { Usuario, UserRole } from '../usuario/entities/usuario.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Profesor } from '../profesor/entities/profesor.entity';
import { Clase } from '../clase/entities/clase.entity';

type EditableUser = Partial<Pick<Usuario, 'nombre' | 'apellido' | 'email' | 'telefono' | 'activo' | 'password'>>;

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Usuario) private readonly userRepository: Repository<Usuario>,
    @InjectRepository(Alumno) private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(Profesor) private readonly profesorRepository: Repository<Profesor>,
    @InjectRepository(Clase) private readonly claseRepository: Repository<Clase>,
  ) {}

  async findAllUsers() {
    const users = await this.userRepository.find({ order: { id: 'ASC' } });
    return users.map((user) => this.publicUser(user));
  }

  async findUserDetail(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const detail: Record<string, unknown> = { ...this.publicUser(user) };
    if (user.tipoUsuario === UserRole.PROFESOR) {
      detail.perfil = await this.profesorRepository.findOne({ where: { usuario_id: id } });
      detail.clases = await this.claseRepository.find({
        where: { profesor: { usuario_id: id } },
        relations: ['club', 'alumnos_inscritos', 'alumnos_inscritos.usuario'],
        order: { fecha_hora: 'DESC' },
      });
    }
    if (user.tipoUsuario === UserRole.ALUMNO) {
      detail.perfil = await this.alumnoRepository.findOne({ where: { usuario_id: id } });
      detail.reservas = await this.claseRepository.find({
        where: { alumnos_inscritos: { usuario_id: id } },
        relations: ['club', 'profesor', 'profesor.usuario'],
        order: { fecha_hora: 'DESC' },
      });
    }
    return detail;
  }

  async updateUser(id: number, body: Record<string, unknown>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const editableKeys: (keyof EditableUser)[] = ['nombre', 'apellido', 'email', 'telefono', 'activo', 'password'];
    const update: EditableUser = {};
    for (const key of editableKeys) {
      if (body[key] !== undefined) update[key] = body[key] as never;
    }
    if (update.password) update.password = await bcrypt.hash(update.password, 10);
    if (Object.keys(update).length > 0) await this.userRepository.update(id, update);
    const updated = await this.userRepository.findOne({ where: { id } });
    return this.publicUser(updated!);
  }

  async removeUser(id: number, requestingUserId: number) {
    if (id === requestingUserId) throw new BadRequestException('No podés eliminar tu propia cuenta de administrador');
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.userRepository.remove(user);
    return { message: 'Usuario eliminado correctamente' };
  }

  private publicUser(user: Usuario) {
    const { password, ...publicUser } = user;
    return publicUser;
  }
}
