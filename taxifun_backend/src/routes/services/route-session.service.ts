// src/routes/services/route-session.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RouteSessionEntity } from '../entities/route-session.entity';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer les sessions d'itinéraires
 * Utilise une store en mémoire (pouvant être remplacée par Redis)
 * Gère la persistance, l'expiration et la récupération des sessions
 */
@Injectable()
export class RouteSessionService {
  private readonly logger = new Logger(RouteSessionService.name);
  private readonly sessionTTL: number;
  // Store en mémoire - à remplacer par Redis pour la production
  private sessions = new Map<string, RouteSessionEntity>();

  constructor(private readonly configService: ConfigService) {
    // TTL par défaut: 1 heure (3600 secondes)
    this.sessionTTL = this.configService.get<number>('ROUTE_SESSION_TTL', 3600);
    this.startCleanupInterval();
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
  ): Promise<RouteSessionEntity> {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.sessionTTL);

    const session: RouteSessionEntity = {
      id: uuidv4(),
      userId,
      origin,
      destination,
      waypoints: [],
      travelMode,
      language,
      provideAlternatives,
      isFinalized: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt,
    };

    this.sessions.set(session.id, session);
    this.logger.log(`Created new route session ${session.id} for user ${userId}`);

    return session;
  }

  /**
   * Récupère une session par son ID
   * Vérifie que la session appartient à l'utilisateur et n'est pas expirée
   */
  async getSession(sessionId: string, userId: string): Promise<RouteSessionEntity> {
    const session = this.sessions.get(sessionId);

    if (!session || session.userId !== userId) {
      throw new NotFoundException(
        `Session ${sessionId} non trouvée ou vous n'avez pas l'autorisation d'y accéder`,
      );
    }

    // Vérifier l'expiration
    if (session.expiresAt && new Date() > session.expiresAt) {
      this.logger.warn(`Session ${sessionId} has expired`);
      this.sessions.delete(sessionId);
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
    updates: Partial<RouteSessionEntity>,
  ): Promise<RouteSessionEntity> {
    const session = await this.getSession(sessionId, userId);

    // Étendre le temps d'expiration à chaque mise à jour
    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + this.sessionTTL);

    const updatedSession: RouteSessionEntity = {
      ...session,
      ...updates,
      updatedAt: new Date(),
      expiresAt: newExpiresAt,
    };

    this.sessions.set(sessionId, updatedSession);
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
  ): Promise<RouteSessionEntity> {
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
  async finalizeSession(sessionId: string, userId: string): Promise<RouteSessionEntity> {
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
  async getUserActiveSessions(userId: string): Promise<RouteSessionEntity[]> {
    const now = new Date();
    return Array.from(this.sessions.values())
      .filter(
        (session) =>
          session.userId === userId &&
          !session.isFinalized &&
          (!session.expiresAt || now <= session.expiresAt),
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Supprime une session
   */
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId, userId);
    this.sessions.delete(sessionId);
    this.logger.log(`Deleted session ${sessionId}`);
  }

  /**
   * Nettoie les sessions expirées
   * Appelé automatiquement toutes les heures
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 3600000); // Toutes les heures
  }

  /**
   * Nettoie les sessions expirées
   */
  private async cleanupExpiredSessions(): Promise<void> {
    this.logger.log('Starting cleanup of expired sessions');

    try {
      const now = new Date();
      let deletedCount = 0;

      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.expiresAt && now > session.expiresAt) {
          this.sessions.delete(sessionId);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        this.logger.log(`Cleaned up ${deletedCount} expired session(s)`);
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
    const now = new Date();
    const allSessions = Array.from(this.sessions.values());

    const totalSessions = allSessions.length;
    const activeSessions = allSessions.filter(
      (s) => !s.isFinalized && (!s.expiresAt || now <= s.expiresAt),
    ).length;
    const finalizedSessions = allSessions.filter((s) => s.isFinalized).length;

    return {
      totalSessions,
      activeSessions,
      finalizedSessions,
    };
  }
}
