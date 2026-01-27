import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour la creation d'un nouvel administrateur.
 *
 * Les administrateurs gerent la plateforme TaxiFun:
 * - Verification des chauffeurs
 * - Gestion des litiges
 * - Supervision des courses
 *
 * @example
 * {
 *   "username": "admin_yaounde",
 *   "email": "admin@taxifun.cm",
 *   "password": "SecureP@ssw0rd!"
 * }
 */
export class CreateAdminDto {
    @ApiProperty({
        example: 'admin_yaounde',
        description: 'Nom d\'utilisateur unique pour l\'administrateur',
        minLength: 3,
        maxLength: 50
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        example: 'admin@taxifun.cm',
        description: 'Adresse email de l\'administrateur (doit etre unique)'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'SecureP@ssw0rd!',
        description: 'Mot de passe (min 8 caracteres, doit contenir majuscule, minuscule et chiffre)',
        minLength: 8
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}
