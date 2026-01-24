import { Module } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';

@Module({
  controllers: [ReservaController],
  providers: [ReservaService],
})
export class ReservaModule {}
