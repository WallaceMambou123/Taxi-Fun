import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
<<<<<<< HEAD
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
=======

@Module({
  controllers: [AdminsController],
  providers: [AdminsService],
>>>>>>> cc8fef2615d4ba134558d599d94cde0f8d040787
})
export class AdminsModule {}
