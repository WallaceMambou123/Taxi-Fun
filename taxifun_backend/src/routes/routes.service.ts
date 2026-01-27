// src/routes/routes.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RouteInitDto } from './dto/route-init.dto';
import { AddWaypointDto } from './dto/add-waypoint.dto';
import { OpenStreetMapService } from './services/openstreetmap.service';
import { RouteSessionService } from './services/route-session.service';
import { RouteResponse } from './interfaces/route-response.interface';

/**
 * Service principal pour la gestion des itinéraires
 * Orchestre les appels entre OpenStreetMapService et RouteSessionService
 */
@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(
    private readonly openStreetMapService: OpenStreetMapService,
    private readonly routeSessionService: RouteSessionService,
  ) {}

  /**
   * Initialise un nouvel itinéraire
   * Crée une session et calcule la première route
   *
   * @param userId ID de l'utilisateur authentifié
   * @param routeInitDto Données d'initialisation de l'itinéraire
   * @returns RouteResponse avec sessionId et route calculée
   */
  async initializeRoute(userId: string, routeInitDto: RouteInitDto): Promise<RouteResponse> {
    this.logger.log(`Initializing route for user ${userId}`);

    // Créer une nouvelle session
    const session = await this.routeSessionService.createSession(
      userId,
      routeInitDto.origin,
      routeInitDto.destination,
      routeInitDto.travelMode || 'DRIVE',
      routeInitDto.language || 'fr',
      routeInitDto.provideAlternatives || false,
    );

    // Calculer la route initiale (sans waypoints)
    const { mainRoute, alternatives } = await this.openStreetMapService.computeRoutes(
      routeInitDto.origin,
      routeInitDto.destination,
      [], // Pas de waypoints pour l'instant
      routeInitDto.travelMode || 'DRIVE',
      routeInitDto.computeAlternativeRoutes || routeInitDto.provideAlternatives || false,
      routeInitDto.language || 'fr',
    );

    // Extraire des suggestions de prochains points d'intérêt
    const suggestedIntersections = this.openStreetMapService.extractSuggestedIntersections(mainRoute, 5);

    // Sauvegarder la route calculée dans la session
    await this.routeSessionService.updateSession(session.id, userId, {
      lastComputedRoute: mainRoute,
      alternatives: alternatives,
    });

    this.logger.log(`Route initialized successfully. Session ID: ${session.id}`);

    return {
      sessionId: session.id,
      origin: routeInitDto.origin,
      destination: routeInitDto.destination,
      waypoints: [],
      currentRoute: mainRoute,
      alternatives: alternatives.length > 0 ? alternatives : undefined,
      suggestedNextIntersections: suggestedIntersections.length > 0 ? suggestedIntersections : undefined,
      metadata: {
        travelMode: routeInitDto.travelMode || 'DRIVE',
        language: routeInitDto.language || 'fr',
        computedAt: new Date(),
        waypointsCount: 0,
      },
    };
  }

  /**
   * Ajoute un waypoint à un itinéraire existant et recalcule
   *
   * @param userId ID de l'utilisateur authentifié
   * @param addWaypointDto Données du waypoint à ajouter
   * @returns RouteResponse mise à jour avec le nouveau waypoint
   */
  async addWaypoint(userId: string, addWaypointDto: AddWaypointDto): Promise<RouteResponse> {
    this.logger.log(`Adding waypoint to session ${addWaypointDto.sessionId}`);

    // Récupérer la session
    const session = await this.routeSessionService.getSession(addWaypointDto.sessionId, userId);

    // Ajouter le waypoint à la session
    const updatedSession = await this.routeSessionService.addWaypoint(
      session.id,
      userId,
      addWaypointDto.newWaypoint,
    );

    // Recalculer la route avec tous les waypoints
    const { mainRoute, alternatives } = await this.openStreetMapService.computeRoutes(
      updatedSession.origin,
      updatedSession.destination,
      updatedSession.waypoints,
      updatedSession.travelMode,
      updatedSession.provideAlternatives,
      updatedSession.language,
    );

    // Extraire de nouvelles suggestions
    const suggestedIntersections = this.openStreetMapService.extractSuggestedIntersections(mainRoute, 5);

    // Sauvegarder la route recalculée
    await this.routeSessionService.updateSession(session.id, userId, {
      lastComputedRoute: mainRoute,
      alternatives: alternatives,
    });

    this.logger.log(
      `Waypoint added successfully to session ${session.id}. Total waypoints: ${updatedSession.waypoints.length}`,
    );

    return {
      sessionId: session.id,
      origin: updatedSession.origin,
      destination: updatedSession.destination,
      waypoints: updatedSession.waypoints,
      currentRoute: mainRoute,
      alternatives: alternatives.length > 0 ? alternatives : undefined,
      suggestedNextIntersections: suggestedIntersections.length > 0 ? suggestedIntersections : undefined,
      metadata: {
        travelMode: updatedSession.travelMode,
        language: updatedSession.language,
        computedAt: new Date(),
        waypointsCount: updatedSession.waypoints.length,
      },
    };
  }

  /**
   * Récupère l'état actuel d'un itinéraire
   *
   * @param sessionId ID de la session
   * @param userId ID de l'utilisateur authentifié
   * @returns RouteResponse avec l'état actuel
   */
  async getRouteStatus(sessionId: string, userId: string): Promise<RouteResponse> {
    this.logger.log(`Fetching route status for session ${sessionId}`);

    const session = await this.routeSessionService.getSession(sessionId, userId);

    // Si on a déjà une route calculée, on la retourne
    if (session.lastComputedRoute) {
      return {
        sessionId: session.id,
        origin: session.origin,
        destination: session.destination,
        waypoints: session.waypoints,
        currentRoute: session.lastComputedRoute,
        alternatives: session.alternatives || undefined,
        metadata: {
          travelMode: session.travelMode,
          language: session.language,
          computedAt: session.updatedAt,
          waypointsCount: session.waypoints.length,
        },
      };
    }

    // Sinon, on recalcule la route
    const { mainRoute, alternatives } = await this.openStreetMapService.computeRoutes(
      session.origin,
      session.destination,
      session.waypoints,
      session.travelMode,
      session.provideAlternatives,
      session.language,
    );

    // Sauvegarder la route calculée
    await this.routeSessionService.updateSession(session.id, userId, {
      lastComputedRoute: mainRoute,
      alternatives: alternatives,
    });

    return {
      sessionId: session.id,
      origin: session.origin,
      destination: session.destination,
      waypoints: session.waypoints,
      currentRoute: mainRoute,
      alternatives: alternatives.length > 0 ? alternatives : undefined,
      metadata: {
        travelMode: session.travelMode,
        language: session.language,
        computedAt: new Date(),
        waypointsCount: session.waypoints.length,
      },
    };
  }

  /**
   * Finalise un itinéraire
   * Marque la session comme finalisée et prolonge son expiration
   *
   * @param sessionId ID de la session
   * @param userId ID de l'utilisateur authentifié
   * @returns RouteResponse finale
   */
  async finalizeRoute(sessionId: string, userId: string): Promise<RouteResponse> {
    this.logger.log(`Finalizing route for session ${sessionId}`);

    const session = await this.routeSessionService.finalizeSession(sessionId, userId);

    return {
      sessionId: session.id,
      origin: session.origin,
      destination: session.destination,
      waypoints: session.waypoints,
      currentRoute: session.lastComputedRoute,
      alternatives: session.alternatives || undefined,
      metadata: {
        travelMode: session.travelMode,
        language: session.language,
        computedAt: session.updatedAt,
        waypointsCount: session.waypoints.length,
      },
    };
  }

  /**
   * Récupère toutes les sessions actives d'un utilisateur
   *
   * @param userId ID de l'utilisateur authentifié
   * @returns Liste des sessions actives
   */
  async getUserActiveSessions(userId: string) {
    this.logger.log(`Fetching active sessions for user ${userId}`);
    return this.routeSessionService.getUserActiveSessions(userId);
  }

  /**
   * Supprime une session d'itinéraire
   *
   * @param sessionId ID de la session
   * @param userId ID de l'utilisateur authentifié
   */
  async deleteRoute(sessionId: string, userId: string): Promise<void> {
    this.logger.log(`Deleting route session ${sessionId}`);
    await this.routeSessionService.deleteSession(sessionId, userId);
  }
}
