import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto, AdminLoginDto, PhoneLoginDto, PhoneVerifyDto, UserRole } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Demande d'envoi d'un code OTP par SMS
     *
     * Flux d'authentification:
     * 1. L'utilisateur (Client/Driver) s'inscrit d'abord via /clients/register ou /drivers/register
     * 2. Ensuite, il demande un OTP via cet endpoint
     * 3. Il recoit un SMS avec un code a 4 chiffres (valide 5 minutes)
     * 4. Il verifie le code via /auth/otp/verify pour obtenir son token JWT
     */
    @Post('otp/request')
    @ApiOperation({
        summary: 'Demander un code OTP',
        description: `Envoie un code OTP a 4 chiffres par SMS au numero de telephone specifie.

**Prerequis:** L'utilisateur doit etre inscrit au prealable.
- Client: POST /clients/register
- Driver: POST /drivers/register

**Validite:** Le code expire apres 5 minutes.

**Roles supportes:** CLIENT, DRIVER (ADMIN non supporte pour l'instant)`
    })
    @ApiBody({
        type: RequestOtpDto,
        examples: {
            client: {
                summary: 'Demande OTP pour un Client',
                description: 'Exemple pour un client camerounais',
                value: {
                    phoneNumber: '+237670000000',
                    role: 'CLIENT'
                }
            },
            driver: {
                summary: 'Demande OTP pour un Chauffeur',
                description: 'Exemple pour un chauffeur taxi',
                value: {
                    phoneNumber: '+237699000000',
                    role: 'DRIVER'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'OTP envoye avec succes',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'OTP envoyé avec succès' },
                expiresIn: { type: 'string', example: '5 minutes' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Utilisateur non trouve - Doit s\'inscrire d\'abord',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Utilisateur non trouvé' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Donnees invalides (numero de telephone mal formate, role invalide)',
    })
    requestOtp(@Body() dto: RequestOtpDto) {
        return this.authService.requestOtp(dto);
    }

    /**
     * Verification du code OTP et obtention du token JWT
     *
     * Apres verification reussie, retourne:
     * - accessToken: JWT valide 7 jours pour authentifier les requetes
     * - user: Informations de l'utilisateur connecte
     */
    @Post('otp/verify')
    @ApiOperation({
        summary: 'Verifier le code OTP',
        description: `Verifie le code OTP recu par SMS et retourne un token JWT d'authentification.

**Utilisation du token:**
Ajoutez le token dans le header Authorization de vos requetes:
\`Authorization: Bearer <votre_token>\`

**Duree de validite:** Le token JWT expire apres 7 jours.

**En cas d'echec:** Apres plusieurs tentatives echouees, demandez un nouveau code OTP.`
    })
    @ApiBody({
        type: VerifyOtpDto,
        examples: {
            client: {
                summary: 'Verification OTP Client',
                description: 'Client verifiant son code OTP',
                value: {
                    phoneNumber: '+237670000000',
                    otpCode: '1234',
                    role: 'CLIENT'
                }
            },
            driver: {
                summary: 'Verification OTP Chauffeur',
                description: 'Chauffeur verifiant son code OTP',
                value: {
                    phoneNumber: '+237699000000',
                    otpCode: '5678',
                    role: 'DRIVER'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Authentification reussie - Token JWT retourne',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'Token JWT a utiliser dans le header Authorization'
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'uuid-xxxx-xxxx' },
                        phoneNumber: { type: 'string', example: '+237670000000' },
                        role: { type: 'string', example: 'CLIENT' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Code OTP invalide ou expire',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Code OTP invalide ou expiré' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Utilisateur non trouve',
    })
    async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req) {
        console.log('Incoming Authorization header for otp/verify:', req.headers?.authorization);
        const result = await this.authService.verifyOtp(dto);
        console.log('Generated JWT Token:', result.accessToken); // Log the generated token
        return result;
    }

    /**
     * Connexion administrateur par email et mot de passe.
     *
     * Les administrateurs n'utilisent pas l'OTP mais un login classique.
     */
    @Post('admin/login')
    @ApiOperation({
        summary: 'Connexion administrateur',
        description: `Authentifie un administrateur avec son email et mot de passe.

**Difference avec OTP:**
Les administrateurs utilisent une authentification classique email/mot de passe
au lieu de l'OTP par SMS utilise par les clients et chauffeurs.

**Utilisation du token:**
Ajoutez le token dans le header Authorization de vos requetes:
\`Authorization: Bearer <votre_token>\`

**Duree de validite:** Le token JWT expire apres 7 jours.`
    })
    @ApiBody({
        type: AdminLoginDto,
        examples: {
            admin: {
                summary: 'Login administrateur',
                description: 'Connexion avec email et mot de passe',
                value: {
                    email: 'admin@taxifun.cm',
                    password: 'SecureP@ssw0rd!'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Authentification reussie - Token JWT retourne',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'Token JWT a utiliser dans le header Authorization'
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'uuid-xxxx-xxxx' },
                        username: { type: 'string', example: 'admin_yaounde' },
                        email: { type: 'string', example: 'admin@taxifun.cm' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Email ou mot de passe incorrect',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Email ou mot de passe incorrect' }
            }
        }
    })
    adminLogin(@Body() dto: AdminLoginDto) {
        //return this.authService.adminLogin(dto);
    }

    // ==================== ENDPOINTS CLIENT ====================

    /**
     * Demande OTP pour un client (endpoint simplifie).
     * Pas besoin de specifier le role.
     */
    @Post('client/login')
    @ApiOperation({
        summary: 'Demander OTP Client',
        description: `Envoie un code OTP par SMS pour connecter un client.

**Prerequis:** Le client doit etre inscrit via POST /clients/register

**Etapes:**
1. POST /auth/client/login (cet endpoint) - Recevoir le code OTP
2. POST /auth/client/verify - Verifier le code et obtenir le token`
    })
    @ApiBody({
        type: PhoneLoginDto,
        examples: {
            client: {
                summary: 'Login client',
                value: { phoneNumber: '+237670000000' }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'OTP envoye avec succes',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'OTP envoyé avec succès' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Client non trouve - Doit s\'inscrire d\'abord' })
    clientLogin(@Body() dto: PhoneLoginDto) {
        return this.authService.requestOtp({ phoneNumber: dto.phoneNumber, role: UserRole.CLIENT });
    }

    /**
     * Verification OTP et obtention du token pour un client.
     */
    @Post('client/verify')
    @ApiOperation({
        summary: 'Verifier OTP et obtenir token Client',
        description: `Verifie le code OTP et retourne le token JWT du client.

**Utilisation du token:**
\`Authorization: Bearer <votre_token>\`

**Validite:** 7 jours`
    })
    @ApiBody({
        type: PhoneVerifyDto,
        examples: {
            client: {
                summary: 'Verification client',
                value: { phoneNumber: '+237670000000', otpCode: '1234' }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Token JWT retourne',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'uuid-xxxx-xxxx' },
                        phoneNumber: { type: 'string', example: '+237670000000' },
                        firstName: { type: 'string', example: 'Jean' },
                        lastName: { type: 'string', example: 'Dupont' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Code OTP invalide ou expire' })
    clientVerify(@Body() dto: PhoneVerifyDto) {
        return this.authService.verifyOtp({ phoneNumber: dto.phoneNumber, otpCode: dto.otpCode, role: UserRole.CLIENT });
    }

    // ==================== ENDPOINTS DRIVER ====================

    /**
     * Demande OTP pour un chauffeur (endpoint simplifie).
     * Pas besoin de specifier le role.
     */
    @Post('driver/login')
    @ApiOperation({
        summary: 'Demander OTP Chauffeur',
        description: `Envoie un code OTP par SMS pour connecter un chauffeur.

**Prerequis:** Le chauffeur doit etre inscrit via POST /drivers/register

**Etapes:**
1. POST /auth/driver/login (cet endpoint) - Recevoir le code OTP
2. POST /auth/driver/verify - Verifier le code et obtenir le token`
    })
    @ApiBody({
        type: PhoneLoginDto,
        examples: {
            driver: {
                summary: 'Login chauffeur',
                value: { phoneNumber: '+237699000000' }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'OTP envoye avec succes',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'OTP envoyé avec succès' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Chauffeur non trouve - Doit s\'inscrire d\'abord' })
    driverLogin(@Body() dto: PhoneLoginDto) {
        return this.authService.requestOtp({ phoneNumber: dto.phoneNumber, role: UserRole.DRIVER });
    }

    /**
     * Verification OTP et obtention du token pour un chauffeur.
     */
    @Post('driver/verify')
    @ApiOperation({
        summary: 'Verifier OTP et obtenir token Chauffeur',
        description: `Verifie le code OTP et retourne le token JWT du chauffeur.

**Utilisation du token:**
\`Authorization: Bearer <votre_token>\`

**Validite:** 7 jours`
    })
    @ApiBody({
        type: PhoneVerifyDto,
        examples: {
            driver: {
                summary: 'Verification chauffeur',
                value: { phoneNumber: '+237699000000', otpCode: '1234' }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Token JWT retourne',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'uuid-xxxx-xxxx' },
                        phoneNumber: { type: 'string', example: '+237699000000' },
                        taxiPlate: { type: 'string', example: 'LT 123 AA' },
                        isAvailable: { type: 'boolean', example: false }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Code OTP invalide ou expire' })
    driverVerify(@Body() dto: PhoneVerifyDto) {
        return this.authService.verifyOtp({ phoneNumber: dto.phoneNumber, otpCode: dto.otpCode, role: UserRole.DRIVER });
    }
}