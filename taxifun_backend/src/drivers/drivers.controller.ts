import { Controller, Post, Get, Patch, Body, Param, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // À créer
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  // Inscription publique
  @Post('register')
  register(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  // Récupérer son propre profil (Nécessite d'être connecté)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getProfile(@Request() req) {
    // req.user est injecté par la JwtStrategy
    return this.driversService.findOne(req.user.id);
  }

  // Mettre à jour son statut (En ligne/Hors ligne)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me/status')
  updateStatus(@Request() req, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(req.user.id, updateDriverDto);
  }
}