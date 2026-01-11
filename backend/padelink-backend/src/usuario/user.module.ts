import { Module } from '@nestjs/common';
import { UserController } from './usuario.controller';
import { UserService } from './usuario.service';

@Module({
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {
    
}
