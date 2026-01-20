import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import { ClientsModule } from './clients/clients.module';
import { DriversModule } from './drivers/drivers.module';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { TripsModule } from './trips/trips.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminsModule } from './admins/admins.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WalletsModule,
    ClientsModule,
    DriversModule,
    ItinerariesModule,
    TripsModule,
    ReviewsModule,
    AdminsModule,
  ],
  providers: [AppService, PrismaService],
})
export class AppModule { }