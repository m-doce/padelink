import { Controller, Get, Param, Post, Body, Inject } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

import type { IUsuarioService } from '../interfaces/IUsuarioService';

@Controller('users')
export class UserController {

    constructor(
        @Inject('IUsuarioService') private readonly userService: IUsuarioService,
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
