// src/routes/services/openstreetmap.service.ts
import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ComputedRoute, Location, RouteStep, SuggestedIntersection } from '../interfaces/route-response.interface';

/**
 * Service pour interagir avec l'API OSRM (OpenStreetMap Routing Machine)
 * API gratuite et open source - pas de clé API requise
 * Documentation: http://project-osrm.org/docs/v5.24.0/api/
 */
@Injectable()
export class OpenStreetMapService {
  private readonly logger = new Logger(OpenStreetMapService.name);
  // Serveur OSRM public gratuit
  private readonly osrmBaseUrl = 'https://router.project-osrm.org';

  /**
   * Calcule les routes avec OSRM API
   *
   * @param origin Point de départ
   * @param destination Point d'arrivée
   * @param waypoints Points intermédiaires (optionnel)
   * @param travelMode Mode de transport (driving, cycling, walking)
   * @param provideAlternatives Demander des routes alternatives
   * @param language Langue des instructions (non utilisé par OSRM, gardé pour compatibilité)
   */
  async computeRoutes(
    origin: Location,
    destination: Location,
    waypoints: Location[] = [],
    travelMode: string = 'DRIVE',
    provideAlternatives: boolean = false,
    language: string = 'fr',
  ): Promise<{ mainRoute: ComputedRoute; alternatives: ComputedRoute[] }> {
    try {
      this.logger.log(
        `Computing route from [${origin.lat},${origin.lng}] to [${destination.lat},${destination.lng}] with ${waypoints.length} waypoints`,
      );

      // Mapper le mode de transport vers le format OSRM
      const osrmProfile = this.mapTravelMode(travelMode);

      // Construire les coordonnées pour l'URL OSRM (format: lng,lat)
      const coordinates = this.buildCoordinatesString(origin, destination, waypoints);

      // Construire l'URL OSRM
      const url = `${this.osrmBaseUrl}/route/v1/${osrmProfile}/${coordinates}`;
      const params = new URLSearchParams({
        overview: 'full',
        geometries: 'polyline',
        steps: 'true',
        annotations: 'true',
        alternatives: provideAlternatives ? 'true' : 'false',
      });

      this.logger.debug(`OSRM Request URL: ${url}?${params}`);

      // Appel à l'API OSRM
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Erreur OSRM: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (data.code !== 'Ok') {
        this.handleOsrmError(data.code, data.message);
      }

      if (!data.routes || data.routes.length === 0) {
        throw new BadRequestException('Aucune route trouvée pour ces paramètres');
      }

      // Parser et formater la route principale
      const mainRoute = this.formatRoute(data.routes[0], data.waypoints);

      // Parser les routes alternatives
      const alternatives: ComputedRoute[] = [];
      if (provideAlternatives && data.routes.length > 1) {
        for (let i = 1; i < Math.min(data.routes.length, 4); i++) {
          alternatives.push(this.formatRoute(data.routes[i], data.waypoints));
        }
      }

      this.logger.log(`Successfully computed ${1 + alternatives.length} route(s)`);

      return { mainRoute, alternatives };
    } catch (error: any) {
      this.logger.error('Error computing routes from OSRM:');
      this.logger.error(`Error message: ${error?.message}`);

      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Impossible de calculer l'itinéraire. Détails: ${error?.message || 'Erreur inconnue'}`,
      );
    }
  }

  /**
   * Extrait des suggestions de prochains points d'intérêt depuis les steps de la route
   * Identifie les gros carrefours ou points stratégiques
   */
  extractSuggestedIntersections(route: ComputedRoute, maxSuggestions: number = 5): SuggestedIntersection[] {
    const suggestions: SuggestedIntersection[] = [];
    let cumulativeDistance = 0;

    // On parcourt les steps de la première leg
    if (route.legs && route.legs.length > 0) {
      const firstLeg = route.legs[0];

      for (const step of firstLeg.steps) {
        cumulativeDistance += step.distance.meters;

        // On suggère des points tous les 5-10 km environ, ou aux grands carrefours
        const instruction = step.instruction.toLowerCase();
        if (
          cumulativeDistance > 5000 && // Au moins 5km
          (instruction.includes('turn') ||
            instruction.includes('rond-point') ||
            instruction.includes('roundabout') ||
            instruction.includes('exit') ||
            instruction.includes('sortie'))
        ) {
          suggestions.push({
            lat: step.endLocation.lat,
            lng: step.endLocation.lng,
            description: step.instruction,
            distanceFromOrigin: cumulativeDistance,
          });

          if (suggestions.length >= maxSuggestions) {
            break;
          }
        }
      }
    }

    return suggestions;
  }

  /**
   * Construit la chaîne de coordonnées pour l'URL OSRM
   * Format OSRM: lng,lat;lng,lat;...
   */
  private buildCoordinatesString(origin: Location, destination: Location, waypoints: Location[]): string {
    const coords: string[] = [];

    // Origin
    coords.push(`${origin.lng},${origin.lat}`);

    // Waypoints
    for (const wp of waypoints) {
      coords.push(`${wp.lng},${wp.lat}`);
    }

    // Destination
    coords.push(`${destination.lng},${destination.lat}`);

    return coords.join(';');
  }

  /**
   * Formate une route OSRM vers notre interface ComputedRoute
   */
  private formatRoute(route: any, waypoints: any[]): ComputedRoute {
    const legs = route.legs.map((leg: any, legIndex: number) => ({
      distance: {
        meters: Math.round(leg.distance),
        text: this.formatDistance(leg.distance),
      },
      duration: {
        seconds: Math.round(leg.duration),
        text: this.formatDuration(leg.duration),
      },
      startLocation: {
        lat: waypoints[legIndex].location[1],
        lng: waypoints[legIndex].location[0],
      },
      endLocation: {
        lat: waypoints[legIndex + 1].location[1],
        lng: waypoints[legIndex + 1].location[0],
      },
      steps: leg.steps.map((step: any) => this.formatStep(step)),
    }));

    // Calculer distance et durée totales
    const totalDistance = Math.round(route.distance);
    const totalDuration = Math.round(route.duration);

    return {
      polyline: route.geometry,
      distance: {
        meters: totalDistance,
        text: this.formatDistance(totalDistance),
      },
      duration: {
        seconds: totalDuration,
        text: this.formatDuration(totalDuration),
      },
      steps: legs.flatMap((leg: any) => leg.steps),
      legs,
      warnings: [],
    };
  }

  /**
   * Formate un step OSRM vers notre interface RouteStep
   */
  private formatStep(step: any): RouteStep {
    // Construire l'instruction à partir du maneuver OSRM
    const instruction = this.buildInstruction(step.maneuver, step.name, step.ref);

    return {
      instruction,
      distance: {
        meters: Math.round(step.distance),
        text: this.formatDistance(step.distance),
      },
      duration: {
        seconds: Math.round(step.duration),
        text: this.formatDuration(step.duration),
      },
      startLocation: {
        lat: step.maneuver.location[1],
        lng: step.maneuver.location[0],
      },
      endLocation: {
        lat: step.maneuver.location[1],
        lng: step.maneuver.location[0],
      },
      polyline: step.geometry || '',
    };
  }

  /**
   * Construit une instruction lisible à partir du maneuver OSRM
   */
  private buildInstruction(maneuver: any, streetName: string, ref: string): string {
    const type = maneuver.type;
    const modifier = maneuver.modifier;

    // Traductions des types de manœuvres en français
    const typeTranslations: Record<string, string> = {
      'turn': 'Tournez',
      'new name': 'Continuez sur',
      'depart': 'Partez vers',
      'arrive': 'Arrivée',
      'merge': 'Rejoignez',
      'on ramp': 'Prenez la bretelle',
      'off ramp': 'Prenez la sortie',
      'fork': 'Prenez',
      'end of road': 'En fin de route,',
      'continue': 'Continuez',
      'roundabout': 'Au rond-point,',
      'rotary': 'Au rond-point,',
      'roundabout turn': 'Au rond-point,',
      'notification': '',
      'exit roundabout': 'Sortez du rond-point',
      'exit rotary': 'Sortez du rond-point',
    };

    const modifierTranslations: Record<string, string> = {
      'uturn': 'faites demi-tour',
      'sharp right': 'à droite (virage serré)',
      'right': 'à droite',
      'slight right': 'légèrement à droite',
      'straight': 'tout droit',
      'slight left': 'légèrement à gauche',
      'left': 'à gauche',
      'sharp left': 'à gauche (virage serré)',
    };

    let instruction = typeTranslations[type] || type;

    if (modifier && modifierTranslations[modifier]) {
      instruction += ` ${modifierTranslations[modifier]}`;
    }

    if (streetName) {
      instruction += ` ${streetName}`;
    }

    if (ref) {
      instruction += ` (${ref})`;
    }

    return instruction.trim();
  }

  /**
   * Mapper notre enum TravelMode vers celui d'OSRM
   */
  private mapTravelMode(mode: string): string {
    const mapping: Record<string, string> = {
      DRIVE: 'driving',
      BICYCLE: 'bike',
      WALK: 'foot',
      TWO_WHEELER: 'driving',
    };

    return mapping[mode] || 'driving';
  }

  /**
   * Formate une distance en mètres vers un texte lisible
   */
  private formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  }

  /**
   * Formate une durée en secondes vers un texte lisible
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  /**
   * Gère les erreurs de l'API OSRM
   */
  private handleOsrmError(code: string, message?: string): void {
    this.logger.error(`OSRM API error: ${code} - ${message}`);

    switch (code) {
      case 'InvalidUrl':
        throw new BadRequestException('URL invalide. Vérifiez les coordonnées.');
      case 'InvalidService':
        throw new BadRequestException('Service invalide.');
      case 'InvalidVersion':
        throw new BadRequestException('Version API invalide.');
      case 'InvalidOptions':
        throw new BadRequestException('Options invalides.');
      case 'InvalidQuery':
        throw new BadRequestException('Requête invalide. Vérifiez les coordonnées.');
      case 'InvalidValue':
        throw new BadRequestException('Valeur invalide dans les paramètres.');
      case 'NoSegment':
        throw new BadRequestException(
          'Impossible de trouver un segment routier près des coordonnées fournies.',
        );
      case 'TooBig':
        throw new BadRequestException('Requête trop volumineuse.');
      case 'NoRoute':
        throw new BadRequestException('Aucun itinéraire trouvé entre ces points.');
      default:
        throw new InternalServerErrorException(`Erreur OSRM: ${code}`);
    }
  }
}
