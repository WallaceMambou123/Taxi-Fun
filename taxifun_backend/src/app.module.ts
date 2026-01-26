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
import { RoutesModule } from './routes/routes.module';
import { RedisModule } from './common/redis/redis.module';
import { SmsModule } from './common/sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    SmsModule,
    PrismaModule,
    AuthModule,
    WalletsModule,
    ClientsModule,
    DriversModule,
    ItinerariesModule,
    TripsModule,
    ReviewsModule,
    AdminsModule,
    RoutesModule,
  ],
  providers: [AppService, PrismaService],
})
export class AppModule { }