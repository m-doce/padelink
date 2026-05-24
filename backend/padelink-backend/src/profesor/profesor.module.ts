import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesorController } from './profesor.controller';
import { ProfesorService } from './profesor.service';
import { Profesor } from './entities/profesor.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profesor, Usuario])],
  controllers: [ProfesorController],
  providers: [
    {
      provide: 'IProfesorService',
      useClass: ProfesorService,
    },
  ],
  exports: ['IProfesorService'],
})
export class ProfesorModule {}
