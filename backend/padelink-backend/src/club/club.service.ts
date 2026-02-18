import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
@Injectable()
export class ClubService {
    constructor(
        @InjectRepository(Club)
        private readonly clubRepository: Repository<Club>,
    ) {}

    async findAll(): Promise<Club[]> {
        return this.clubRepository.find();
    }

    async findOne(id: number): Promise<Club | null> {
        return this.clubRepository.findOne({ where: { club_id: id } });
    }

    async update(id: number, updateClubDto: UpdateClubDto): Promise<Club | null> {
        await this.clubRepository.update(id, updateClubDto);
        return this.clubRepository.findOne({where: {club_id: id}});
    }

    async create(createClubDto: CreateClubDto): Promise <Club> {
        const club = this.clubRepository.create(createClubDto);
        return this.clubRepository.save(club);
    }
}
