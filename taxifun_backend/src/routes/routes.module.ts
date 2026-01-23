// src/routes/routes.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { OpenStreetMapService } from './services/openstreetmap.service';
import { RouteSessionService } from './services/route-session.service';

/**
 * Module pour la gestion des itinéraires
 * Fournit les fonctionnalités de construction manuelle d'itinéraires avec OpenStreetMap (OSRM)
 */
@Module({
  imports: [PrismaModule],
  controllers: [RoutesController],
  providers: [RoutesService, OpenStreetMapService, RouteSessionService],
  exports: [RoutesService],
})
export class RoutesModule {}
