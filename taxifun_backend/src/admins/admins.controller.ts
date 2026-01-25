import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admins - Administrateurs')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  /**
   * Creer un nouvel administrateur.
   *
   * Note: Cet endpoint devrait etre protege en production.
   * Seul un super-admin devrait pouvoir creer d'autres admins.
   */
  @Post()
  @ApiOperation({
    summary: 'Creer un administrateur',
    description: `Cree un nouveau compte administrateur pour gerer la plateforme TaxiFun.

**Roles de l'administrateur:**
- Verification et validation des chauffeurs
- Gestion des litiges entre clients et chauffeurs
- Supervision des courses en temps reel
- Gestion des paiements et remboursements

**Securite:** En production, cet endpoint devrait etre restreint aux super-admins.`
  })
  @ApiBody({
    type: CreateAdminDto,
    examples: {
      adminYaounde: {
        summary: 'Admin Yaounde',
        description: 'Administrateur pour la zone de Yaounde',
        value: {
          username: 'admin_yaounde',
          email: 'admin.yaounde@taxifun.cm',
          password: 'SecureP@ssw0rd123!'
        }
      },
      adminDouala: {
        summary: 'Admin Douala',
        description: 'Administrateur pour la zone de Douala',
        value: {
          username: 'admin_douala',
          email: 'admin.douala@taxifun.cm',
          password: 'SecureP@ssw0rd456!'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Administrateur cree avec succes',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-xxxx-xxxx-xxxx' },
        username: { type: 'string', example: 'admin_yaounde' },
        email: { type: 'string', example: 'admin.yaounde@taxifun.cm' },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Donnees invalides (email mal formate, mot de passe trop court)',
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou username deja utilise',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Cet email est déjà utilisé' }
      }
    }
  })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  /**
   * Recuperer la liste de tous les administrateurs.
   */
  @Get()
  @ApiOperation({
    summary: 'Lister tous les administrateurs',
    description: `Retourne la liste complete des administrateurs de la plateforme.

**Note:** En production, cet endpoint devrait etre protege et accessible uniquement aux super-admins.`
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des administrateurs',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-xxxx-xxxx-xxxx' },
          username: { type: 'string', example: 'admin_yaounde' },
          email: { type: 'string', example: 'admin@taxifun.cm' },
          createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' }
        }
      }
    }
  })
  findAll() {
    return this.adminsService.findAll();
  }

  /**
   * Recuperer un administrateur par son ID.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Recuperer un administrateur',
    description: 'Retourne les details d\'un administrateur specifique par son ID UUID.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de l\'administrateur',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Details de l\'administrateur',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-xxxx-xxxx-xxxx' },
        username: { type: 'string', example: 'admin_yaounde' },
        email: { type: 'string', example: 'admin@taxifun.cm' },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Administrateur non trouve',
  })
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  /**
   * Mettre a jour les informations d'un administrateur.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un administrateur',
    description: `Permet de modifier les informations d'un administrateur.

**Champs modifiables:**
- username
- email
- password`
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de l\'administrateur a modifier',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    type: UpdateAdminDto,
    examples: {
      modifierEmail: {
        summary: 'Modifier l\'email',
        value: {
          email: 'nouvel.email@taxifun.cm'
        }
      },
      modifierUsername: {
        summary: 'Modifier le username',
        value: {
          username: 'super_admin_yaounde'
        }
      },
      modifierMotDePasse: {
        summary: 'Modifier le mot de passe',
        value: {
          password: 'NouveauMotDePasse123!'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Administrateur mis a jour',
  })
  @ApiResponse({
    status: 404,
    description: 'Administrateur non trouve',
  })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(id, updateAdminDto);
  }

  /**
   * Supprimer un administrateur.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un administrateur',
    description: `Supprime definitivement un compte administrateur.

**Attention:** Cette action est irreversible.

**Note:** En production, seul un super-admin devrait pouvoir supprimer des admins.`
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de l\'administrateur a supprimer',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Administrateur supprime avec succes',
  })
  @ApiResponse({
    status: 404,
    description: 'Administrateur non trouve',
  })
  remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }
}
