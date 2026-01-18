// src/auth/guards/client.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

/**
 * Guard qui vérifie que l'utilisateur connecté est un client
 * À utiliser après AuthGuard('jwt') pour restreindre l'accès aux endpoints clients
 *
 * Usage:
 * @UseGuards(AuthGuard('jwt'), ClientGuard)
 */
@Injectable()
export class ClientGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    if (user.role !== UserRole.CLIENT) {
      throw new ForbiddenException(
        'Accès réservé aux clients. Connectez-vous via /auth/client/login',
      );
    }

    return true;
  }
}
