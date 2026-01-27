import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';
import { RoutesService } from './routes.service';
import { RouteInitDto } from './dto/route-init.dto';
import { AddWaypointDto } from './dto/add-waypoint.dto';
import { FinalizeRouteDto } from './dto/finalize-route.dto';
import { DriverGuard } from '../auth/guards/driver.guard';

@ApiTags('Routes - Construction manuelle d\'itinéraires (Chauffeurs uniquement)')
@ApiBearerAuth('JWT-auth')
@Controller('routes')
@UseGuards(AuthGuard('jwt'), DriverGuard) // JWT + Vérification rôle chauffeur
export class RoutesController {
  private readonly logger = new Logger(RoutesController.name);

  constructor(private readonly routesService: RoutesService) {}

  @Post('init')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Démarrer un nouvel itinéraire',
    description:
      'Crée une session temporaire pour construire un itinéraire. ' +
      'Nécessite origin et destination. Retourne un sessionId à conserver.',
  })
  @ApiBody({
    type: RouteInitDto,
    description: 'Point de départ, destination et options (mode, langue, alternatives...)',
    examples: {
      example1: {
        value: {
          origin: { lat: 3.865, lng: 11.502 },
          destination: { lat: 3.952, lng: 11.608 },
          travelMode: 'DRIVE',
          language: 'fr',
          provideAlternatives: true,
        },
        summary: 'Exemple Chapelle Obili → Chateau simplifié',
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Session créée et premier calcul d\'itinéraire effectué',
    content: {
      'application/json': {
        example: {
          sessionId: 'clz8k9p2r0001j08l3f5gabcde',
          origin: { lat: 3.865, lng: 11.502 },
          destination: { lat: 3.952, lng: 11.608 },
          waypoints: [],
          currentRoute: {
            distance: { text: '145 km', value: 145000 },
            duration: { text: '2 h 12 min', value: 7920 },
            polyline: 'encoded_polyline_string_here...',
          },
          alternatives: [/* ... */],
          suggestedNextIntersections: [/* ... */],
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Origin ou destination invalide / mal formé' })
  @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
  @ApiForbiddenResponse({ description: 'Accès réservé aux chauffeurs uniquement' })
  async initializeRoute(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) routeInitDto: RouteInitDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    this.logger.log(`User ${userId} initialize new route`);

    return this.routesService.initializeRoute(userId, routeInitDto);
  }

  @Post('add-waypoint')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ajouter un point de passage obligatoire',
    description: 'Ajoute un waypoint et recalcule l\'itinéraire complet avec ce point forcé.',
  })
  @ApiBody({
    type: AddWaypointDto,
    examples: {
      example: {
        value: {
          sessionId: 'clz8k9p2r0001j08l3f5gabcde',
          newWaypoint: { lat: 3.912, lng: 11.545 },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Waypoint ajouté et itinéraire recalculé',
  })
  @ApiBadRequestResponse({ description: 'SessionId ou waypoint invalide' })
  @ApiNotFoundResponse({ description: 'Session non trouvée ou n\'appartient pas à cet utilisateur' })
  async addWaypoint(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) addWaypointDto: AddWaypointDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    this.logger.log(`User ${userId} add waypoint to ${addWaypointDto.sessionId}`);

    return this.routesService.addWaypoint(userId, addWaypointDto);
  }

  @Get(':sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter l\'état actuel de la session',
    description: 'Récupère tous les waypoints et la dernière version calculée de l\'itinéraire.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Identifiant de la session d\'itinéraire',
    example: 'clz8k9p2r0001j08l3f5gabcde',
  })
  @ApiOkResponse({ description: 'État complet de l\'itinéraire' })
  @ApiNotFoundResponse({ description: 'Session introuvable ou accès non autorisé' })
  async getRouteStatus(@Param('sessionId') sessionId: string, @Request() req) {
    const userId = req.user.userId;
    return this.routesService.getRouteStatus(sessionId, userId);
  }

  @Post('finalize/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Finaliser l\'itinéraire',
    description:
      'Valide l\'itinéraire actuel. La session devient en lecture seule ' +
      '(plus de modification possible).',
  })
  @ApiParam({ name: 'sessionId', description: 'ID de la session à finaliser' })
  @ApiBody({
    type: FinalizeRouteDto,
    required: false,
    description: 'Optionnel : nom, notes, catégorie...',
  })
  @ApiOkResponse({ description: 'Itinéraire finalisé avec succès' })
  @ApiNotFoundResponse({ description: 'Session introuvable' })
  async finalizeRoute(
    @Param('sessionId') sessionId: string,
    @Body(new ValidationPipe({ transform: true })) finalizeDto: FinalizeRouteDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.routesService.finalizeRoute(sessionId, userId);
  }

  @Get('user/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister mes sessions d\'itinéraires en cours',
    description: 'Retourne les sessions non-finalisées de l\'utilisateur connecté.',
  })
  @ApiOkResponse({ description: 'Liste des sessions actives' })
  async getUserActiveSessions(@Request() req) {
    const userId = req.user.userId;
    return this.routesService.getUserActiveSessions(userId);
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une session d\'itinéraire',
    description: 'Supprime définitivement une session (en cours ou finalisée).',
  })
  @ApiParam({ name: 'sessionId', description: 'ID de la session à supprimer' })
  @ApiOkResponse({
    description: 'Session supprimée',
    content: {
      'application/json': {
        example: { message: 'Itinéraire supprimé avec succès', sessionId: 'xxx' },
      },
    },
  })
  async deleteRoute(@Param('sessionId') sessionId: string, @Request() req) {
    const userId = req.user.userId;
    await this.routesService.deleteRoute(sessionId, userId);
    return { message: 'Itinéraire supprimé avec succès', sessionId };
  }
}