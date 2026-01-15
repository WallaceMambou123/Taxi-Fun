// src/routes/services/google-maps.service.ts
import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, TravelMode as GMTravelMode, DirectionsResponse } from '@googlemaps/google-maps-services-js';
import { ComputedRoute, Location, RouteStep, SuggestedIntersection } from '../interfaces/route-response.interface';

/**
 * Service pour interagir avec l'API Google Maps
 * Gère les appels vers l'API Directions/Routes et le formatage des réponses
 */
@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly client: Client;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';

    if (!this.apiKey || this.apiKey === 'your_google_maps_api_key_here') {
      this.logger.warn('⚠️  GOOGLE_MAPS_API_KEY n\'est pas configurée correctement');
    }

    this.client = new Client({});
  }

  /**
   * Calcule les routes avec Google Directions API
   * Note: Pour utiliser la nouvelle Routes API v2, il faudrait utiliser l'API REST directement
   * car le client JS officiel utilise encore l'ancienne API Directions
   *
   * @param origin Point de départ
   * @param destination Point d'arrivée
   * @param waypoints Points intermédiaires (optionnel)
   * @param travelMode Mode de transport
   * @param provideAlternatives Demander des routes alternatives
   * @param language Langue des instructions
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

      // Mapper le mode de transport vers le format Google Maps
      const gmTravelMode = this.mapTravelMode(travelMode);

      // Préparer les waypoints pour l'API
      const waypointsFormatted = waypoints.map((wp) => ({ lat: wp.lat, lng: wp.lng }));

      // Appel à l'API Directions
      const response = await this.client.directions({
        params: {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          waypoints: waypointsFormatted.length > 0 ? waypointsFormatted : undefined,
          mode: gmTravelMode,
          alternatives: provideAlternatives,
          language: language as any, // Type cast pour compatibilité
          units: 'metric' as any, // Type cast pour compatibilité
          key: this.apiKey,
          // Options avancées pour optimiser les coûts
          optimize: false, // On ne veut pas optimiser l'ordre des waypoints
          avoid: [], // Peut être configuré: tolls, highways, ferries
        },
        timeout: 10000, // 10 secondes de timeout
      });

      if (response.data.status !== 'OK') {
        this.handleGoogleMapsError(response.data.status, response.data.error_message);
      }

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new BadRequestException('Aucune route trouvée pour ces paramètres');
      }

      // Parser et formater la route principale
      const mainRoute = this.formatRoute(response.data.routes[0]);

      // Parser les routes alternatives
      const alternatives: ComputedRoute[] = [];
      if (provideAlternatives && response.data.routes.length > 1) {
        for (let i = 1; i < Math.min(response.data.routes.length, 4); i++) {
          alternatives.push(this.formatRoute(response.data.routes[i]));
        }
      }

      this.logger.log(`Successfully computed ${1 + alternatives.length} route(s)`);

      return { mainRoute, alternatives };
    } catch (error) {
      this.logger.error('Error computing routes from Google Maps', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Impossible de calculer l\'itinéraire. Vérifiez votre clé API Google Maps.',
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
        if (
          cumulativeDistance > 5000 && // Au moins 5km
          (step.instruction.toLowerCase().includes('turn') ||
            step.instruction.toLowerCase().includes('rond-point') ||
            step.instruction.toLowerCase().includes('sortie'))
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
   * Formate une route Google Maps vers notre interface ComputedRoute
   */
  private formatRoute(route: DirectionsResponse['data']['routes'][0]): ComputedRoute {
    const legs = route.legs.map((leg) => ({
      distance: {
        meters: leg.distance?.value || 0,
        text: leg.distance?.text || '',
      },
      duration: {
        seconds: leg.duration?.value || 0,
        text: leg.duration?.text || '',
      },
      startLocation: {
        lat: leg.start_location.lat,
        lng: leg.start_location.lng,
      },
      endLocation: {
        lat: leg.end_location.lat,
        lng: leg.end_location.lng,
      },
      steps: leg.steps.map((step) => this.formatStep(step)),
    }));

    // Calculer distance et durée totales
    const totalDistance = legs.reduce((sum, leg) => sum + leg.distance.meters, 0);
    const totalDuration = legs.reduce((sum, leg) => sum + leg.duration.seconds, 0);

    return {
      polyline: route.overview_polyline.points,
      distance: {
        meters: totalDistance,
        text: `${(totalDistance / 1000).toFixed(1)} km`,
      },
      duration: {
        seconds: totalDuration,
        text: this.formatDuration(totalDuration),
      },
      steps: legs.flatMap((leg) => leg.steps),
      legs,
      warnings: route.warnings,
    };
  }

  /**
   * Formate un step Google Maps vers notre interface RouteStep
   */
  private formatStep(step: any): RouteStep {
    return {
      instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || '',
      distance: {
        meters: step.distance?.value || 0,
        text: step.distance?.text || '',
      },
      duration: {
        seconds: step.duration?.value || 0,
        text: step.duration?.text || '',
      },
      startLocation: {
        lat: step.start_location.lat,
        lng: step.start_location.lng,
      },
      endLocation: {
        lat: step.end_location.lat,
        lng: step.end_location.lng,
      },
      polyline: step.polyline?.points || '',
    };
  }

  /**
   * Mapper notre enum TravelMode vers celui de Google Maps
   */
  private mapTravelMode(mode: string): GMTravelMode {
    const mapping: Record<string, GMTravelMode> = {
      DRIVE: GMTravelMode.driving,
      BICYCLE: GMTravelMode.bicycling,
      WALK: GMTravelMode.walking,
      TWO_WHEELER: GMTravelMode.driving, // Pas de mode spécifique, on utilise driving
    };

    return mapping[mode] || GMTravelMode.driving;
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
   * Gère les erreurs de l'API Google Maps
   */
  private handleGoogleMapsError(status: string, errorMessage?: string): void {
    this.logger.error(`Google Maps API error: ${status} - ${errorMessage}`);

    switch (status) {
      case 'INVALID_REQUEST':
        throw new BadRequestException(
          'Requête invalide. Vérifiez les coordonnées fournies.',
        );
      case 'ZERO_RESULTS':
        throw new BadRequestException(
          'Aucun itinéraire trouvé entre ces points.',
        );
      case 'OVER_QUERY_LIMIT':
        throw new InternalServerErrorException(
          'Quota API Google Maps dépassé. Réessayez plus tard.',
        );
      case 'REQUEST_DENIED':
        throw new InternalServerErrorException(
          'Requête refusée par Google Maps. Vérifiez votre clé API.',
        );
      case 'UNKNOWN_ERROR':
        throw new InternalServerErrorException(
          'Erreur serveur Google Maps. Réessayez.',
        );
      default:
        throw new InternalServerErrorException(
          `Erreur Google Maps: ${status}`,
        );
    }
  }
}
