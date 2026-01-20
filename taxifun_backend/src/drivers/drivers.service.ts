import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) { }

  // Inscription
  async create(createDriverDto: CreateDriverDto) {
    try {
      return await this.prisma.driver.create({
        data: createDriverDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Phone number or Plate already exists');
      }
      throw error;
    }
  }

  // Utilisé par l'AuthService
  async findByPhone(phoneNumber: string) {
    return this.prisma.driver.findUnique({
      where: { phoneNumber },
    });
  }

  // Profil personnel (pour l'app Driver)
  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { wallet: true } // On inclut le solde
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  // Mise à jour (Status, GPS, etc.)
  async update(id: string, updateDriverDto: UpdateDriverDto) {
    return this.prisma.driver.update({
      where: { id },
      data: updateDriverDto,
    });
  }
}