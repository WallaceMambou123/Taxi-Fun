// src/auth/guards/driver.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

/**
 * Guard qui vérifie que l'utilisateur connecté est un chauffeur (driver)
 * À utiliser après AuthGuard('jwt') pour restreindre l'accès aux endpoints chauffeurs
 *
 * Usage:
 * @UseGuards(AuthGuard('jwt'), DriverGuard)
 */
@Injectable()
export class DriverGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    if (user.role !== UserRole.DRIVER) {
      throw new ForbiddenException(
        'Accès réservé aux chauffeurs. Connectez-vous via /auth/driver/login',
      );
    }

    return true;
  }
}
