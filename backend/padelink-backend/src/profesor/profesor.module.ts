import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesorController } from './profesor.controller';
import { ProfesorService } from './profesor.service';
import { Profesor } from './profesor.entity';
import { Usuario } from 'src/usuario/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profesor, Usuario])],
  controllers: [ProfesorController],
  providers: [ProfesorService]
})
export class ProfesorModule {}
