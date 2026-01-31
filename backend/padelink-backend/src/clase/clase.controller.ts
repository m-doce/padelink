import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClaseService } from './clase.service';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';

@Controller('clase')
export class ClaseController {
  constructor(private readonly claseService: ClaseService) {}

  @Post()
  create(@Body() createClaseDto: CreateClaseDto) {
    return this.claseService.create(createClaseDto);
  }

  @Get()
  findAll() {
    return this.claseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.claseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClaseDto: UpdateClaseDto) {
    return this.claseService.update(+id, updateClaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.claseService.remove(+id);
  }
}
