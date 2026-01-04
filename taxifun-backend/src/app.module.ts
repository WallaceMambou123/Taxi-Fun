import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';  // <--- Ajoute cette ligne
import { User } from './auth/entities/user.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { RideModule } from './ride/ride.module';
import { Ride } from './ride/entities/ride.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
       port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Ride],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    DashboardModule,
    RideModule,  
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}