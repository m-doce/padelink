import { Module } from '@nestjs/common';
import { UserController } from './usuario.controller';
import { UserService } from './usuario.service';
import { PasswordService } from './password.service';
import { RegistrationService } from './registration.service';
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
  providers: [
    {
      provide: 'IUsuarioService',
      useClass: UserService,
    },
    PasswordService,
    RegistrationService,
  ],
  exports: ['IUsuarioService', PasswordService],
})
export class UserModule {}
