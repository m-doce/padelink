import { Module } from '@nestjs/common';
import { ReseniaService } from './resenia.service';
import { ReseniaController } from './resenia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resenia } from './entities/resenia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resenia])],
  controllers: [ReseniaController],
  providers: [ReseniaService],
})
export class ReseniaModule {}
