import { Module } from '@nestjs/common';
import { UserController } from './usuario.controller';
import { UserService } from './usuario.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { AlumnoModule } from '../alumno/alumno.module';
import { ProfesorModule } from '../profesor/profesor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    AlumnoModule,
    ProfesorModule,
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {
    
}
