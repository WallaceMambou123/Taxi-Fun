import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
// import { DashboardModule } from './dashboard/dashboard.module'; // Gardé en commentaire comme ton original
import { RideModule } from './ride/ride.module';
import { Ride } from './ride/entities/ride.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Sur Render, les variables d'environnement sont injectées directement, 
      // le fichier .env n'est plus nécessaire en production.
      envFilePath: '.env', 
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // Changé de 'mysql' à 'postgres'
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10), // Port 5432 pour Postgres
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Ride],
      synchronize: true, // À désactiver en production réelle une fois les tables créées
      logging: true,
      // Configuration SSL indispensable pour Render PostgreSQL
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    AuthModule,
    RideModule,  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}