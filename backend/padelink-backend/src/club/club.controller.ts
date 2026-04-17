import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { ClubService } from './club.service';

@Controller('club')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Get()
  findAll() {
    return this.clubService.findAll();
  }

  @Post ()
  createClub(@Body() club: CreateClubDto){
    return this.clubService.create(club);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.clubService.findOne(id);
  }
}
