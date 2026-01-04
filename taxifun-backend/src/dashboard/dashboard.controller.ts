import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { ApiOperation, ApiResponse,  } from '@nestjs/swagger';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))  // ← Protège TOUTES les routes du controller
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

@Get()
  @ApiOperation({ summary: 'Afficher le tableau de bord personnalisé selon le rôle' })
  @ApiResponse({ status: 200, description: 'Dashboard client ou chauffeur' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getDashboard(@Request() req) {
    return this.dashboardService.getDashboardData(req.user);
  }
}
