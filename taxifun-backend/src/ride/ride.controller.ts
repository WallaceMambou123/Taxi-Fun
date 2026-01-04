import { Controller, Post, Get, Body, UseGuards, Request, ForbiddenException, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RideService } from './ride.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UserRole } from '../auth/entities/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('rides')
@ApiBearerAuth('JWT-auth')
@Controller('rides')
@UseGuards(AuthGuard('jwt'))
@Controller('rides')
@UseGuards(AuthGuard('jwt'))
export class RideController {
  constructor(private rideService: RideService) {}

  @Post()
  @ApiOperation({ summary: 'Commander une course (client uniquement)' })
  @ApiBody({
    type: CreateRideDto,
    examples: {
      exemple: {
        value: {
          pickupAddress: '10 Avenue des Champs-Élysées, Paris',
          dropoffAddress: 'Tour Eiffel, Paris',
          estimatedPrice: 22.50
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Course créée' })
  @ApiResponse({ status: 403, description: 'Seuls les clients...' })
  async create(@Request() req, @Body() createRideDto: CreateRideDto) {
    if (req.user.role !== UserRole.CLIENT) {
      throw new ForbiddenException('Seuls les clients peuvent commander une course');
    }
    return this.rideService.createRide(createRideDto, req.user.userId);
  }

  @Get('available')
  @ApiOperation({ summary: 'Voir les courses disponibles (chauffeur uniquement)' })
  @ApiResponse({ status: 200, description: 'Liste des courses pending' })
  async getAvailable(@Request() req) {
    if (req.user.role !== UserRole.DRIVER) {
      throw new ForbiddenException('Seuls les chauffeurs peuvent voir les courses disponibles');
    }
    return this.rideService.getAvailableRides();
  }

 @Post(':id/accept')
  @ApiOperation({ summary: 'Accepter une course (chauffeur uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la course à accepter' })
  @ApiResponse({ status: 200, description: 'Course acceptée' })
  async accept(
    @Param('id', ParseIntPipe) rideId: number,
    @Request() req,
  ) {
    if (req.user.role !== UserRole.DRIVER) {
      throw new ForbiddenException('Seuls les chauffeurs peuvent accepter une course');
    }

    return this.rideService.acceptRide(rideId, req.user.userId);
  }
}