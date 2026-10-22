import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Profesor } from '../profesor/entities/profesor.entity';
import { Clase } from '../clase/entities/clase.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Usuario, Alumno, Profesor, Clase])],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
