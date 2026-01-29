import { IsString, IsNotEmpty, IsPhoneNumber, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum pour identifier le type d'utilisateur.
 * Determine dans quelle table chercher l'utilisateur lors de l'authentification.
 */
export enum UserRole {
    /** Passager/Client qui commande des courses */
    CLIENT = 'CLIENT',
    /** Chauffeur de taxi qui accepte les courses */
    DRIVER = 'DRIVER',
    /** Administrateur de la plateforme (non supporte pour OTP) */
    ADMIN = 'ADMIN'
}

/**
 * DTO pour demander l'envoi d'un code OTP par SMS.
 *
 * @example
 * // Pour un client
 * { "phoneNumber": "+237670000000", "role": "CLIENT" }
 *
 * @example
 * // Pour un chauffeur
 * { "phoneNumber": "+237699000000", "role": "DRIVER" }
 */
export class RequestOtpDto {
    @ApiProperty({
        example: '+237670000000',
        description: 'Numero de telephone au format international avec indicatif pays (+237 pour Cameroun)',
        pattern: '^\\+[1-9]\\d{1,14}$'
    })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({
        enum: UserRole,
        enumName: 'UserRole',
        description: 'Type d\'utilisateur: CLIENT (passager) ou DRIVER (chauffeur). ADMIN non supporte.',
        example: 'CLIENT'
    })
    @IsEnum(UserRole)
    role: UserRole;
}

/**
 * DTO pour verifier le code OTP et obtenir un token JWT.
 *
 * @example
 * // Verification pour un client
 * { "phoneNumber": "+237670000000", "otpCode": "1234", "role": "CLIENT" }
 *
 * @example
 * // Verification pour un chauffeur
 * { "phoneNumber": "+237699000000", "otpCode": "5678", "role": "DRIVER" }
 */
export class VerifyOtpDto {
    @ApiProperty({
        example: '+237670000000',
        description: 'Meme numero de telephone utilise pour demander l\'OTP',
        pattern: '^\\+[1-9]\\d{1,14}$'
    })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({
        example: '1234',
        description: 'Code OTP a 4 chiffres recu par SMS. Valide pendant 5 minutes.',
        minLength: 4,
        maxLength: 4
    })
    @IsString()
    @IsNotEmpty()
    otpCode: string;

    @ApiProperty({
        enum: UserRole,
        enumName: 'UserRole',
        description: 'Meme role que celui utilise pour demander l\'OTP',
        example: 'CLIENT'
    })
    @IsEnum(UserRole)
    role: UserRole;
}

/**
 * DTO pour la connexion d'un administrateur.
 *
 * Les administrateurs utilisent email/mot de passe au lieu de l'OTP.
 *
 * @example
 * { "email": "admin@taxifun.cm", "password": "SecureP@ssw0rd!" }
 */
export class AdminLoginDto {
    @ApiProperty({
        example: 'admin@taxifun.cm',
        description: 'Adresse email de l\'administrateur'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'SecureP@ssw0rd!',
        description: 'Mot de passe de l\'administrateur'
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}

/**
 * DTO simplifie pour demander un OTP (sans specifier le role).
 * Utilise pour les endpoints dedies client/driver.
 *
 * @example
 * { "phoneNumber": "+237670000000" }
 */
export class PhoneLoginDto {
    @ApiProperty({
        example: '+237670000000',
        description: 'Numero de telephone au format international'
    })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
}

/**
 * DTO simplifie pour verifier un OTP (sans specifier le role).
 * Utilise pour les endpoints dedies client/driver.
 *
 * @example
 * { "phoneNumber": "+237670000000", "otpCode": "1234" }
 */
export class PhoneVerifyDto {
    @ApiProperty({
        example: '+237670000000',
        description: 'Numero de telephone'
    })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({
        example: '1234',
        description: 'Code OTP a 4 chiffres recu par SMS'
    })
    @IsString()
    @IsNotEmpty()
    otpCode: string;
}