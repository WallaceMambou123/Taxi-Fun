// src/routes/dto/location.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO pour représenter une localisation géographique
 * Utilisé pour origin, destination et waypoints
 */
export class LocationDto {
  @IsNotEmpty({ message: 'La latitude est requise' })
  @IsNumber({}, { message: 'La latitude doit être un nombre' })
  @Min(-90, { message: 'La latitude doit être >= -90' })
  @Max(90, { message: 'La latitude doit être <= 90' })
  @Type(() => Number)
  lat: number;

  @IsNotEmpty({ message: 'La longitude est requise' })
  @IsNumber({}, { message: 'La longitude doit être un nombre' })
  @Min(-180, { message: 'La longitude doit être >= -180' })
  @Max(180, { message: 'La longitude doit être <= 180' })
  @Type(() => Number)
  lng: number;

  @IsOptional()
  @IsString()
  address?: string;
}
