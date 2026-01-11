import { Injectable } from '@nestjs/common';
import { CreateReseniaDto } from './dto/create-resenia.dto';
import { UpdateReseniaDto } from './dto/update-resenia.dto';

@Injectable()
export class ReseniaService {
  create(createReseniaDto: CreateReseniaDto) {
    return 'This action adds a new resenia';
  }

  findAll() {
    return `This action returns all resenia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} resenia`;
  }

  update(id: number, updateReseniaDto: UpdateReseniaDto) {
    return `This action updates a #${id} resenia`;
  }

  remove(id: number) {
    return `This action removes a #${id} resenia`;
  }
}
