import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

import { UserService } from './usuario.service';

@Controller('users')
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
