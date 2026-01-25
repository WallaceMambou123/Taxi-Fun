import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Clients - Passagers')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  /**
   * Inscription d'un nouveau client/passager.
   *
   * Etape 1 du flux d'authentification:
   * 1. POST /clients/register (cet endpoint)
   * 2. POST /auth/otp/request avec role=CLIENT
   * 3. POST /auth/otp/verify pour obtenir le token
   */
  @Post('register')
  @ApiOperation({
    summary: 'Inscription d\'un nouveau client',
    description: `Cree un compte client/passager avec son numero de telephone.

**Flux complet d'inscription:**
1. **Inscription:** POST /clients/register (cet endpoint)
2. **Demande OTP:** POST /auth/otp/request avec role=CLIENT
3. **Verification:** POST /auth/otp/verify pour obtenir le token JWT

**Note:** Le client peut completer son profil (nom, email) apres connexion.`
  })
  @ApiBody({
    type: CreateClientDto,
    examples: {
      minimal: {
        summary: 'Inscription minimale',
        description: 'Uniquement le numero de telephone (obligatoire)',
        value: {
          phoneNumber: '+237670000000'
        }
      },
      complet: {
        summary: 'Inscription complete',
        description: 'Avec toutes les informations personnelles',
        value: {
          phoneNumber: '+237670000000',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@email.com'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Client cree avec succes',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-xxxx-xxxx-xxxx' },
        phoneNumber: { type: 'string', example: '+237670000000' },
        firstName: { type: 'string', example: 'Jean', nullable: true },
        lastName: { type: 'string', example: 'Dupont', nullable: true },
        email: { type: 'string', example: 'jean.dupont@email.com', nullable: true },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Donnees invalides (numero de telephone mal formate, email invalide)',
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
  register(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  /**
   * Recuperer le profil du client connecte.
   * Necessite un token JWT valide dans le header Authorization.
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'Recuperer mon profil client',
    description: `Retourne les informations du client actuellement connecte.

**Authentification requise:** Oui (Bearer Token)

**Comment obtenir le token:**
1. POST /auth/otp/request avec votre numero et role=CLIENT
2. POST /auth/otp/verify avec le code recu par SMS
3. Utilisez le accessToken retourne dans le header: \`Authorization: Bearer <token>\``
  })
  @ApiResponse({
    status: 200,
    description: 'Profil du client',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-xxxx-xxxx-xxxx' },
        phoneNumber: { type: 'string', example: '+237670000000' },
        firstName: { type: 'string', example: 'Jean' },
        lastName: { type: 'string', example: 'Dupont' },
        email: { type: 'string', example: 'jean.dupont@email.com' },
        totalRides: { type: 'number', example: 25 },
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
    return this.clientsService.findOne(req.user.id);
  }

  /**
   * Mettre a jour les informations du profil client.
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({
    summary: 'Mettre a jour mon profil',
    description: `Permet au client de modifier ses informations personnelles.

**Champs modifiables:**
- Prenom (firstName)
- Nom (lastName)
- Email

**Authentification requise:** Oui (Bearer Token)`
  })
  @ApiBody({
    type: UpdateClientDto,
    examples: {
      modifierNom: {
        summary: 'Modifier le nom',
        description: 'Mettre a jour le prenom et nom',
        value: {
          firstName: 'Marie',
          lastName: 'Martin'
        }
      },
      ajouterEmail: {
        summary: 'Ajouter un email',
        description: 'Ajouter une adresse email au profil',
        value: {
          email: 'marie.martin@email.com'
        }
      },
      profilComplet: {
        summary: 'Mise a jour complete',
        description: 'Modifier toutes les informations',
        value: {
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@email.com'
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
        phoneNumber: { type: 'string', example: '+237670000000' },
        firstName: { type: 'string', example: 'Marie' },
        lastName: { type: 'string', example: 'Martin' },
        email: { type: 'string', example: 'marie.martin@email.com' },
        updatedAt: { type: 'string', example: '2024-01-15T14:45:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT manquant ou invalide',
  })
  @ApiResponse({
    status: 400,
    description: 'Donnees invalides (email mal formate)',
  })
  updateProfile(@Request() req, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(req.user.id, updateClientDto);
  }
}