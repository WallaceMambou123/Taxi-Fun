import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardData(user: { userId: number; email: string; role: UserRole }) {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.userId },
    });

    if (!currentUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // Base commune
    const dashboard = {
      email: currentUser.email,
      role: currentUser.role,
      balance: currentUser.balance,
      message: `Bienvenue ${currentUser.role === UserRole.CLIENT ? 'client' : 'chauffeur'} !`,
    };

    // Personnalisation selon le rôle
    if (currentUser.role === UserRole.CLIENT) {
      return {
        ...dashboard,
        info: 'Vous pouvez commander une course ou recharger votre compte.',
        upcomingFeatures: ['Historique des courses', 'Commandes en cours'],
      };
    }

    if (currentUser.role === UserRole.DRIVER) {
      return {
        ...dashboard,
        info: 'Vous pouvez accepter des commandes et gérer vos retraits.',
        upcomingFeatures: ['Commandes disponibles à proximité', 'Statistiques du jour'],
      };
    }

    return dashboard;
  }
}