import { Injectable } from '@nestjs/common';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClaseService {
  
  constructor(
    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,
  ) {}

  async create(createClaseDto: CreateClaseDto) {
    return this.claseRepository.save(createClaseDto);
  }
  
  async findAll() {
    return this.claseRepository.find();
  }

  async findOne(id: number) {
    return this.claseRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    return this.claseRepository.delete(id);
  }

  async update(id:number, updateClaseDto: UpdateClaseDto) {
    return this.claseRepository.update(id, updateClaseDto);
  }

}