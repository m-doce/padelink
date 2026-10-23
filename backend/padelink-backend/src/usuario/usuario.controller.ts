import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UserService } from './usuario.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/usuario.entity';

// Gestión directa de usuarios: solo para administradores.
// El registro público pasa por POST /auth/register, que no permite crear administradores.
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class UserController {

    constructor(
        private readonly userService: UserService,
    ) {}

    @Get()
    findAll() {
        return this.userService.findALl();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.userService.findOne(id);
    }

    @Post()
    create(@Body() createUsuarioDto: CreateUsuarioDto) {
        return this.userService.create(createUsuarioDto);
    }

}
