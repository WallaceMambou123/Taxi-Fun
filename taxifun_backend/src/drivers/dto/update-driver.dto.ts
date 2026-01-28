import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateDriverDto } from './create-driver.dto';

/**
 * DTO pour la mise a jour du profil chauffeur.
 *
 * Tous les champs sont optionnels. Seuls les champs fournis seront mis a jour.
 *
 * @example
 * // Passer en ligne (disponible)
 * { "isAvailable": true }
 *
 * @example
 * // Modifier la plaque
 * { "taxiPlate": "LT 456 BB" }
 */
export class UpdateDriverDto extends PartialType(CreateDriverDto) {
    @ApiPropertyOptional({
        example: true,
        description: 'Statut de disponibilite: true = disponible pour courses, false = non disponible'
    })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}
