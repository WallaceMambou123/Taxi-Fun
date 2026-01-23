// src/routes/dto/finalize-route.dto.ts
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO pour finaliser un itinéraire
 * Peut inclure des métadonnées supplémentaires lors de la validation finale
 */
export class FinalizeRouteDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  routeName?: string;
}
