import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour l'inscription d'un nouveau client/passager.
 *
 * Seul le numero de telephone est obligatoire.
 * Les autres informations peuvent etre ajoutees apres inscription.
 *
 * @example
 * // Inscription minimale
 * { "phoneNumber": "+237670000000" }
 *
 * @example
 * // Inscription complete
 * { "phoneNumber": "+237670000000", "firstName": "Jean", "lastName": "Dupont", "email": "jean@email.com" }
 */
export class CreateClientDto {
    @ApiProperty({
        example: '+237670000000',
        description: 'Numero de telephone au format international (ex: +237 pour Cameroun)',
        pattern: '^\\+[1-9]\\d{1,14}$'
    })
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiPropertyOptional({
        example: 'Jean',
        description: 'Prenom du client'
    })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional({
        example: 'Dupont',
        description: 'Nom de famille du client'
    })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional({
        example: 'jean.dupont@email.com',
        description: 'Adresse email du client (pour les notifications)'
    })
    @IsOptional()
    @IsEmail()
    email?: string;
}