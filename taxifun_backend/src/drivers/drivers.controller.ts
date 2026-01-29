import { Controller, Post, Get, Patch, Body, Param, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Drivers - Chauffeurs')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  /**
   * Inscription d'un nouveau chauffeur.
   *
   * Etape 1 du flux d'authentification:
   * 1. POST /drivers/register (cet endpoint)
   * 2. POST /auth/otp/request avec role=DRIVER
   * 3. POST /auth/otp/verify pour obtenir le token
   */
  @Post('register')
  @ApiOperation({
    summary: 'Inscription d\'un nouveau chauffeur',
    description: `Cree un compte chauffeur avec son numero de telephone.

**Flux complet d'inscription:**
1. **Inscription:** POST /drivers/register (cet endpoint)
2. **Demande OTP:** POST /auth/otp/request avec role=DRIVER
3. **Verification:** POST /auth/otp/verify pour obtenir le token JWT

**Note:** Le chauffeur peut completer son profil (plaque, permis) apres connexion.`
  })
  @ApiBody({
    type: CreateDriverDto,
    examples: {
      minimal: {
        summary: 'Inscription minimale',
        description: 'Uniquement le numero de telephone (obligatoire)',
        value: {
          phoneNumber: '+237699000000'
        }
      },
      complet: {
        summary: 'Inscription complete',
        description: 'Avec toutes les informations du vehicule',
        value: {
          phoneNumber: '+237699000000',
          taxiPlate: 'LT 123 AA',
          licenseNumber: 'P1234567'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Chauffeur cree avec succes',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-xxxx-xxxx-xxxx' },
        phoneNumber: { type: 'string', example: '+237699000000' },
        taxiPlate: { type: 'string', example: 'LT 123 AA', nullable: true },
        licenseNumber: { type: 'string', example: 'P1234567', nullable: true },
        isAvailable: { type: 'boolean', example: false },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Donnees invalides (numero de telephone mal formate)',
  })
  @ApiResponse({
    status: 409,
    description: 'Numero de telephone deja utilise',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Ce numéro de téléphone est déjà enregistré' }
      }
    }
  })
  register(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  /**
   * Recuperer le profil du chauffeur connecte.
   * Necessite un token JWT valide dans le header Authorization.
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'Recuperer mon profil chauffeur',
    description: `Retourne les informations du chauffeur actuellement connecte.

**Authentification requise:** Oui (Bearer Token)

**Comment obtenir le token:**
1. POST /auth/otp/request avec votre numero et role=DRIVER
2. POST /auth/otp/verify avec le code recu par SMS
3. Utilisez le accessToken retourne dans le header: \`Authorization: Bearer <token>\``
  })
  @ApiResponse({
    status: 200,
    description: 'Profil du chauffeur',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-xxxx-xxxx-xxxx' },
        phoneNumber: { type: 'string', example: '+237699000000' },
        taxiPlate: { type: 'string', example: 'LT 123 AA' },
        licenseNumber: { type: 'string', example: 'P1234567' },
        isAvailable: { type: 'boolean', example: true },
        rating: { type: 'number', example: 4.5 },
        totalRides: { type: 'number', example: 150 },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT manquant ou invalide',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  getProfile(@Request() req) {
    return this.driversService.findOne(req.user.id);
  }

  /**
   * Mettre a jour le statut ou les informations du chauffeur.
   * Permet de passer en ligne/hors ligne ou de modifier les infos du vehicule.
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me/status')
  @ApiOperation({
    summary: 'Mettre a jour mon statut/profil',
    description: `Permet au chauffeur de:
- Passer en ligne (disponible pour courses) ou hors ligne
- Modifier les informations de son vehicule (plaque, permis)

**Authentification requise:** Oui (Bearer Token)`
  })
  @ApiBody({
    type: UpdateDriverDto,
    examples: {
      passerEnLigne: {
        summary: 'Passer en ligne',
        description: 'Le chauffeur devient disponible pour recevoir des courses',
        value: {
          isAvailable: true
        }
      },
      passerHorsLigne: {
        summary: 'Passer hors ligne',
        description: 'Le chauffeur n\'est plus disponible',
        value: {
          isAvailable: false
        }
      },
      modifierVehicule: {
        summary: 'Modifier infos vehicule',
        description: 'Mettre a jour la plaque d\'immatriculation',
        value: {
          taxiPlate: 'LT 456 BB',
          licenseNumber: 'P9876543'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Profil mis a jour avec succes',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-xxxx-xxxx-xxxx' },
        phoneNumber: { type: 'string', example: '+237699000000' },
        taxiPlate: { type: 'string', example: 'LT 456 BB' },
        isAvailable: { type: 'boolean', example: true },
        updatedAt: { type: 'string', example: '2024-01-15T14:45:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT manquant ou invalide',
  })
  updateStatus(@Request() req, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(req.user.id, updateDriverDto);
  }
}