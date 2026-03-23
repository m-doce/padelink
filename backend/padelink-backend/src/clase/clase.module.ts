import { Module } from '@nestjs/common';
import { ClaseService } from './clase.service';
import { ClaseController } from './clase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { ProfesorModule } from '../profesor/profesor.module';
import { AlumnoModule } from '../alumno/alumno.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clase, Alumno]),
    ProfesorModule,
    AlumnoModule,
  ],
  controllers: [ClaseController],
  providers: [ClaseService],
})
export class ClaseModule {}
