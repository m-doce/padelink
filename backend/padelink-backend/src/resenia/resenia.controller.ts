import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReseniaService } from './resenia.service';
import { CreateReseniaDto } from './dto/create-resenia.dto';
import { UpdateReseniaDto } from './dto/update-resenia.dto';

@Controller('resenia')
@UseGuards(AuthGuard('jwt'))
export class ReseniaController {
  constructor(private readonly reseniaService: ReseniaService) {}

  @Post()
  create(@Body() createReseniaDto: CreateReseniaDto) {
    return this.reseniaService.create(createReseniaDto);
  }

  @Get()
  findAll() {
    return this.reseniaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reseniaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReseniaDto: UpdateReseniaDto) {
    return this.reseniaService.update(+id, updateReseniaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reseniaService.remove(+id);
  }
}
