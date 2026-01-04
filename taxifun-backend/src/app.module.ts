// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // rend ConfigService disponible partout
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User], // on ajoutera les entités plus tard
      synchronize: true, // crée automatiquement les tables en dev (à désactiver en prod)
      logging: true,    // utile pour voir les requêtes SQL au début
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}