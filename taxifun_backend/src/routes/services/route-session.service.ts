// src/routes/services/route-session.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RouteSession } from '../entities/route-session.entity';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Service pour gérer les sessions d'itinéraires
 * Gère la persistance, l'expiration et la récupération des sessions
 */
@Injectable()
export class RouteSessionService {
  private readonly logger = new Logger(RouteSessionService.name);
  private readonly sessionTTL: number;

  constructor(
    @InjectRepository(RouteSession)
    private readonly routeSessionRepository: Repository<RouteSession>,
    private readonly configService: ConfigService,
  ) {
    // TTL par défaut: 1 heure (3600 secondes)
    this.sessionTTL = this.configService.get<number>('ROUTE_SESSION_TTL', 3600);
  }

  /**
   * Crée une nouvelle session d'itinéraire
   */
  async createSession(
    userId: string,
    origin: { lat: number; lng: number; address?: string },
    destination: { lat: number; lng: number; address?: string },
    travelMode: string,
    language: string,
    provideAlternatives: boolean,
  ): Promise<RouteSession> {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.sessionTTL);

    const session = this.routeSessionRepository.create({
      userId,
      origin,
      destination,
      waypoints: [],
      travelMode,
      language,
      provideAlternatives,
      isFinalized: false,
      expiresAt,
    });

    const savedSession = await this.routeSessionRepository.save(session);
    this.logger.log(`Created new route session ${savedSession.id} for user ${userId}`);

    return savedSession;
  }

  /**
   * Récupère une session par son ID
   * Vérifie que la session appartient à l'utilisateur et n'est pas expirée
   */
  async getSession(sessionId: string, userId: string): Promise<RouteSession> {
    const session = await this.routeSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException(
        `Session ${sessionId} non trouvée ou vous n'avez pas l'autorisation d'y accéder`,
      );
    }

    // Vérifier l'expiration
    if (session.expiresAt && new Date() > session.expiresAt) {
      this.logger.warn(`Session ${sessionId} has expired`);
      throw new NotFoundException('Cette session a expiré');
    }

    return session;
  }

  /**
   * Met à jour une session existante avec de nouvelles données
   */
  async updateSession(
    sessionId: string,
    userId: string,
    updates: Partial<RouteSession>,
  ): Promise<RouteSession> {
    const session = await this.getSession(sessionId, userId);

    // Étendre le temps d'expiration à chaque mise à jour
    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + this.sessionTTL);

    Object.assign(session, updates, { expiresAt: newExpiresAt });

    const updatedSession = await this.routeSessionRepository.save(session);
    this.logger.log(`Updated session ${sessionId}`);

    return updatedSession;
  }

  /**
   * Ajoute un waypoint à une session
   */
  async addWaypoint(
    sessionId: string,
    userId: string,
    waypoint: { lat: number; lng: number; address?: string },
  ): Promise<RouteSession> {
    const session = await this.getSession(sessionId, userId);

    session.waypoints.push(waypoint);

    return this.updateSession(sessionId, userId, {
      waypoints: session.waypoints,
    });
  }

  /**
   * Finalise une session d'itinéraire
   * Marque la session comme finalisée pour qu'elle ne soit plus modifiable
   */
  async finalizeSession(sessionId: string, userId: string): Promise<RouteSession> {
    const session = await this.getSession(sessionId, userId);

    if (session.isFinalized) {
      this.logger.warn(`Session ${sessionId} is already finalized`);
      return session;
    }

    // Prolonger l'expiration pour les sessions finalisées (24h)
    const finalizedExpiresAt = new Date();
    finalizedExpiresAt.setHours(finalizedExpiresAt.getHours() + 24);

    return this.updateSession(sessionId, userId, {
      isFinalized: true,
      expiresAt: finalizedExpiresAt,
    });
  }

  /**
   * Récupère toutes les sessions actives d'un utilisateur
   */
  async getUserActiveSessions(userId: string): Promise<RouteSession[]> {
    return this.routeSessionRepository.find({
      where: {
        userId,
        isFinalized: false,
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  /**
   * Supprime une session
   */
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId, userId);
    await this.routeSessionRepository.remove(session);
    this.logger.log(`Deleted session ${sessionId}`);
  }

  /**
   * Tâche cron pour nettoyer les sessions expirées
   * S'exécute toutes les heures
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions(): Promise<void> {
    this.logger.log('Starting cleanup of expired sessions');

    try {
      const result = await this.routeSessionRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      if (result.affected && result.affected > 0) {
        this.logger.log(`Cleaned up ${result.affected} expired session(s)`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired sessions', error);
    }
  }

  /**
   * Obtient des statistiques sur les sessions (utile pour monitoring)
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    finalizedSessions: number;
  }> {
    const [totalSessions, activeSessions, finalizedSessions] = await Promise.all([
      this.routeSessionRepository.count(),
      this.routeSessionRepository.count({ where: { isFinalized: false } }),
      this.routeSessionRepository.count({ where: { isFinalized: true } }),
    ]);

    return {
      totalSessions,
      activeSessions,
      finalizedSessions,
    };
  }
}
