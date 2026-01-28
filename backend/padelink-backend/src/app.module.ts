import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesorModule } from './profesor/profesor.module';
import { AlumnoModule } from './alumno/alumno.module';
import { AdminModule } from './admin/admin.module';
import { ReseniaModule } from './resenia/resenia.module';
import { ClaseModule } from './clase/clase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'admin',
      database: process.env.DB_NAME ?? 'bd_padelink',
      autoLoadEntities: true,
      synchronize: (process.env.DB_SYNC ?? 'false') === 'true',
      logging: process.env.DB_LOGGING === 'true',
    }),
    ProfesorModule,
    AlumnoModule,
    AdminModule,
    ReseniaModule,
    ClaseModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
