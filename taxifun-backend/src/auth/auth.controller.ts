// src/auth/auth.controller.ts
import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('auth')  // ← Très important : préfixe 'auth'
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscrire un nouvel utilisateur (client ou chauffeur)' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      client: {
        summary: 'Inscription client',
        value: {
          email: 'client2@test.com',
          password: 'Password123',
          role: 'client',
          phone: '0612345678'
        }
      },
      driver: {
        summary: 'Inscription chauffeur',
        value: {
          email: 'driver2@test.com',
          password: 'Password123',
          role: 'driver',
          phone: '0698765432'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Inscription réussie' })
  @ApiResponse({ status: 400, description: 'Email déjà utilisé' })
  @UsePipes(ValidationPipe)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'Inscription OK', userId: user.id };
  }

 @Post('login')
  @ApiOperation({ summary: 'Se connecter et obtenir un token JWT' })
  @ApiBody({
    type: LoginDto,
    examples: {
      exemple: {
        value: {
          email: 'client1@test.com',
          password: 'Password123'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Login réussi', schema: { example: { accessToken: 'eyJhbGciOi...' } } })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  @UsePipes(ValidationPipe)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}