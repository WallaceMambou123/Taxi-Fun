// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Active la validation globale (pour les DTO)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('TaxiFun API')
    .setDescription('API backend pour l\'application de taxi TaxiFun')
    .setVersion('1.0')
    .addTag('auth', 'Authentification et inscription')
    .addTag('dashboard', 'Tableau de bord personnalisé')
    .addTag('rides', 'Gestion des courses (commander, accepter, etc.)')
    .addTag('wallet', 'Gestion du portefeuille (recharge, retrait)') // futur
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrer ton token JWT',
        in: 'header',
      },
      'JWT-auth', // ce nom sera utilisé dans @ApiBearerAuth
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // garde le token même après refresh
    },
  });

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger documentation: http://localhost:3000/api`);
}
bootstrap();