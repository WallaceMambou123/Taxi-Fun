// src/routes/dto/add-waypoint.dto.ts
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { LocationDto } from './location.dto';

/**
 * DTO pour ajouter un waypoint à un itinéraire existant
 * Utilisé par l'endpoint POST /routes/add-waypoint
 */
export class AddWaypointDto {
  @IsNotEmpty({ message: 'L\'ID de session est requis' })
  @IsUUID('4', { message: 'L\'ID de session doit être un UUID valide' })
  @IsString()
  sessionId: string;

  @IsNotEmpty({ message: 'Le nouveau waypoint est requis' })
  @ValidateNested()
  @Type(() => LocationDto)
  newWaypoint: LocationDto;
}
