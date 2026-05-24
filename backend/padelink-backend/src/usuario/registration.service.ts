import { Injectable, Inject } from '@nestjs/common';
import { UserRole } from './entities/usuario.entity';
import { AlumnoService } from '../alumno/alumno.service';
import type { IProfesorService } from '../interfaces/IProfesorService';

@Injectable()
export class RegistrationService {
    constructor(
        private readonly alumnoService: AlumnoService,
        @Inject('IProfesorService')
        private readonly profesorService: IProfesorService,
    ) {}

    async registerProfile(userId: number, role: UserRole): Promise<void> {
        switch(role) {
            case UserRole.ALUMNO:
                await this.alumnoService.create(userId);
                break;
            case UserRole.PROFESOR:
                await this.profesorService.create(userId);
                break;
        }
    }
}
