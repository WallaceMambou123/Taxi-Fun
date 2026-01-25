import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour l'inscription d'un nouveau chauffeur.
 *
 * Seul le numero de telephone est obligatoire.
 * Les autres informations peuvent etre ajoutees apres inscription.
 *
 * @example
 * // Inscription minimale
 * { "phoneNumber": "+237699000000" }
 *
 * @example
 * // Inscription complete
 * { "phoneNumber": "+237699000000", "taxiPlate": "LT 123 AA", "licenseNumber": "P1234567" }
 */
export class CreateDriverDto {
    @ApiProperty({
        example: '+237699000000',
        description: 'Numero de telephone au format international (ex: +237 pour Cameroun)',
        pattern: '^\\+[1-9]\\d{1,14}$'
    })
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiPropertyOptional({
        example: 'LT 123 AA',
        description: 'Plaque d\'immatriculation du taxi (format camerounais: LT XXX AA)'
    })
    @IsOptional()
    @IsString()
    taxiPlate?: string;

    @ApiPropertyOptional({
        example: 'P1234567',
        description: 'Numero de permis de conduire du chauffeur'
    })
    @IsOptional()
    @IsString()
    licenseNumber?: string;
}