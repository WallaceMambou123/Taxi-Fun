import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) { }

  // Création initiale (Appelé lors du register)
  async create(ownerId: string, role: 'CLIENT' | 'DRIVER') {
    return this.prisma.wallet.create({
      data: {
        balance: 0.0,
        currency: 'XAF',
        [role === 'CLIENT' ? 'clientId' : 'driverId']: ownerId,
      },
    });
  }

  // Consulter son solde
  async getBalance(ownerId: string, role: 'CLIENT' | 'DRIVER') {
    const wallet = await this.prisma.wallet.findFirst({
      where: role === 'CLIENT' ? { clientId: ownerId } : { driverId: ownerId },
    });
    if (!wallet) throw new NotFoundException('Wallet non trouvé');
    return wallet;
  }
}