// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from './entities/user.entity';

/**
 * Contrôleur d'authentification
 * Gère les inscriptions et connexions pour clients et chauffeurs
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // ============================================
  // ENDPOINTS CLIENT
  // ============================================

  @Post('client/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Inscription Client',
    description: 'Créer un nouveau compte client pour réserver des courses',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      client: {
        value: {
          email: 'client@example.com',
          password: 'SecurePassword123!',
          phone: '+237690000000',
          role: 'client',
        },
        summary: 'Exemple inscription client',
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Compte client créé avec succès',
    schema: {
      example: {
        id: 1,
        email: 'client@example.com',
        phone: '+237690000000',
        role: 'client',
        balance: 0,
        createdAt: '2026-01-15T10:30:00Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Email déjà utilisé ou données invalides' })
  async registerClient(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    registerDto: RegisterDto,
  ) {
    this.logger.log(`New client registration attempt: ${registerDto.email}`);

    // Forcer le rôle client
    const clientDto = { ...registerDto, role: UserRole.CLIENT };

    const user = await this.authService.register(clientDto);

    // Ne pas retourner le password
    const { password, ...result } = user as any;
    return result;
  }

  @Post('client/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion Client',
    description: 'Se connecter en tant que client pour réserver des courses',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      client: {
        value: {
          email: 'client@example.com',
          password: 'SecurePassword123!',
        },
        summary: 'Connexion client',
      },
    },
  })
  @ApiOkResponse({
    description: 'Connexion réussie - Token JWT retourné',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'client@example.com',
          role: 'client',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Identifiants incorrects' })
  async loginClient(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    loginDto: LoginDto,
  ) {
    this.logger.log(`Client login attempt: ${loginDto.email}`);

    const { accessToken } = await this.authService.login(loginDto);

    return {
      accessToken,
    };
  }

  // ============================================
  // ENDPOINTS DRIVER (CHAUFFEUR)
  // ============================================

  @Post('driver/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Inscription Chauffeur',
    description: 'Créer un nouveau compte chauffeur pour gérer des courses et itinéraires',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      driver: {
        value: {
          email: 'driver@example.com',
          password: 'SecurePassword123!',
          phone: '+237690000001',
          role: 'driver',
        },
        summary: 'Exemple inscription chauffeur',
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Compte chauffeur créé avec succès',
    schema: {
      example: {
        id: 2,
        email: 'driver@example.com',
        phone: '+237690000001',
        role: 'driver',
        balance: 0,
        createdAt: '2026-01-15T10:30:00Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Email déjà utilisé ou données invalides' })
  async registerDriver(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    registerDto: RegisterDto,
  ) {
    this.logger.log(`New driver registration attempt: ${registerDto.email}`);

    // Forcer le rôle driver
    const driverDto = { ...registerDto, role: UserRole.DRIVER };

    const user = await this.authService.register(driverDto);

    const { password, ...result } = user as any;
    return result;
  }

  @Post('driver/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion Chauffeur',
    description:
      'Se connecter en tant que chauffeur. Le token retourné permet d\'accéder aux endpoints de gestion d\'itinéraires',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      driver: {
        value: {
          email: 'driver@example.com',
          password: 'SecurePassword123!',
        },
        summary: 'Connexion chauffeur',
      },
    },
  })
  @ApiOkResponse({
    description: 'Connexion réussie - Token JWT retourné (utilisez ce token pour /routes/*)',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 2,
          email: 'driver@example.com',
          role: 'driver',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Identifiants incorrects' })
  async loginDriver(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    loginDto: LoginDto,
  ) {
    this.logger.log(`Driver login attempt: ${loginDto.email}`);

    const { accessToken } = await this.authService.login(loginDto);

    return {
      accessToken,
    };
  }
}
