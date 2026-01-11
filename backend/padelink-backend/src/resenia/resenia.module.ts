import { Module } from '@nestjs/common';
import { ReseniaService } from './resenia.service';
import { ReseniaController } from './resenia.controller';

@Module({
  controllers: [ReseniaController],
  providers: [ReseniaService],
})
export class ReseniaModule {}
