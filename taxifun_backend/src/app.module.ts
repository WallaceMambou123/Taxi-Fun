import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
<<<<<<< HEAD
import { AppController } from './app.controller';
=======
>>>>>>> cc8fef2615d4ba134558d599d94cde0f8d040787
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import { ClientsModule } from './clients/clients.module';
import { DriversModule } from './drivers/drivers.module';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { TripsModule } from './trips/trips.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminsModule } from './admins/admins.module';
<<<<<<< HEAD
import { RoutesModule } from './routes/routes.module';
import { CacheModule } from './common/cache/cache.module';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule,
=======
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
>>>>>>> cc8fef2615d4ba134558d599d94cde0f8d040787
    PrismaModule,
    AuthModule,
    WalletsModule,
    ClientsModule,
    DriversModule,
    ItinerariesModule,
    TripsModule,
    ReviewsModule,
    AdminsModule,
<<<<<<< HEAD
    RoutesModule,
  ],
  controllers: [AppController],
=======
  ],
>>>>>>> cc8fef2615d4ba134558d599d94cde0f8d040787
  providers: [AppService, PrismaService],
})
export class AppModule { }