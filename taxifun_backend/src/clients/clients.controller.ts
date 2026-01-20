import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Post('register')
  register(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getProfile(@Request() req) {
    // req.user est rempli par JwtStrategy (sub = id)
    return this.clientsService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  updateProfile(@Request() req, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(req.user.id, updateClientDto);
  }
}