import { Module } from '@nestjs/common';
import { ClaseService } from './clase.service';
import { ClaseController } from './clase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clase])],
  controllers: [ClaseController],
  providers: [ClaseService],
})
export class ClaseModule {}
