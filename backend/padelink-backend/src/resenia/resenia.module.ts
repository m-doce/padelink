import { Module } from '@nestjs/common';
import { ReseniaService } from './resenia.service';
import { ReseniaController } from './resenia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resenia } from './entities/resenia.entity';
import { Profesor } from '../profesor/entities/profesor.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Clase } from '../clase/entities/clase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resenia, Profesor, Alumno, Clase])],
  controllers: [ReseniaController],
  providers: [ReseniaService],
})
export class ReseniaModule {}
