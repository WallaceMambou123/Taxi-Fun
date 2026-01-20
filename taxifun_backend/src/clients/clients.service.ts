import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) { }

  async create(createClientDto: CreateClientDto) {
    try {
      return await this.prisma.client.create({
        data: createClientDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Phone number or Email already exists');
      }
      throw error;
    }
  }

  async findByPhone(phoneNumber: string) {
    return this.prisma.client.findUnique({
      where: { phoneNumber },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { wallet: true }
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }
}