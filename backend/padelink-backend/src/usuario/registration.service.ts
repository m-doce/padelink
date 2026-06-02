import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserRole } from './entities/usuario.entity';
import { AlumnoService } from '../alumno/alumno.service';
import { ProfesorService } from '../profesor/profesor.service';

@Injectable()
export class RegistrationService implements OnModuleInit {
    private registrationHandlers: Map<UserRole, (userId: number) => Promise<void>>;

    constructor(
        private readonly alumnoService: AlumnoService,
        private readonly profesorService: ProfesorService,
    ) {
        this.registrationHandlers = new Map();
    }

    onModuleInit() {
        this.registrationHandlers.set(UserRole.ALUMNO, (userId) => this.alumnoService.create(userId).then(() => {}));
        this.registrationHandlers.set(UserRole.PROFESOR, (userId) => this.profesorService.create(userId).then(() => {}));
        // Para agregar nuevos roles, simplemente se añade un handler aquí o mediante un método de registro
    }

    async registerProfile(userId: number, role: UserRole): Promise<void> {
        const handler = this.registrationHandlers.get(role);
        if (handler) {
            await handler(userId);
        }
    }
}
