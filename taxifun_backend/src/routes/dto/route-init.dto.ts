// src/routes/dto/route-init.dto.ts
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LocationDto } from './location.dto';

/**
 * Modes de transport supportés par Google Routes API
 */
export enum TravelMode {
  DRIVE = 'DRIVE',
  BICYCLE = 'BICYCLE',
  WALK = 'WALK',
  TWO_WHEELER = 'TWO_WHEELER',
}

/**
 * Options de qualité de calcul d'itinéraire
 */
export enum RoutingPreference {
  TRAFFIC_AWARE = 'TRAFFIC_AWARE', // Tient compte du trafic en temps réel
  TRAFFIC_AWARE_OPTIMAL = 'TRAFFIC_AWARE_OPTIMAL', // Optimisation avec trafic
  TRAFFIC_UNAWARE = 'TRAFFIC_UNAWARE', // Ignore le trafic
}

/**
 * DTO pour initialiser un nouvel itinéraire
 * Utilisé par l'endpoint POST /routes/init
 */
export class RouteInitDto {
  @IsNotEmpty({ message: 'Le point de départ est requis' })
  @ValidateNested()
  @Type(() => LocationDto)
  origin: LocationDto;

  @IsNotEmpty({ message: 'La destination est requise' })
  @ValidateNested()
  @Type(() => LocationDto)
  destination: LocationDto;

  @IsOptional()
  @IsEnum(TravelMode, {
    message: 'Mode de transport invalide. Valeurs acceptées: DRIVE, BICYCLE, WALK, TWO_WHEELER',
  })
  travelMode?: TravelMode = TravelMode.DRIVE;

  @IsOptional()
  @IsBoolean({ message: 'provideAlternatives doit être un booléen' })
  provideAlternatives?: boolean = false;

  @IsOptional()
  @IsEnum(RoutingPreference, {
    message: 'Préférence de routage invalide',
  })
  routingPreference?: RoutingPreference = RoutingPreference.TRAFFIC_AWARE_OPTIMAL;

  @IsOptional()
  @IsString()
  language?: string = 'fr';

  @IsOptional()
  @IsString()
  units?: 'METRIC' | 'IMPERIAL' = 'METRIC';

  @IsOptional()
  @IsBoolean()
  computeAlternativeRoutes?: boolean = false;
}
