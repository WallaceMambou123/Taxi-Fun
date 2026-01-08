// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ←←← AJOUTE ÇA ICI POUR RÉGLER LE CORS
  app.enableCors({
    origin: 'http://localhost:8080', // Autorise uniquement ton frontend Vite
    credentials: true,               // Important si tu utilises des cookies plus tard
  });
  // Ou pour développer rapidement : app.enableCors(); // autorise tout (*)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuration Swagger (tu l'as déjà)
  const config = new DocumentBuilder()
    .setTitle('TaxiFun API')
    .setDescription('API backend pour l\'application de taxi TaxiFun')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('dashboard')
    .addTag('rides')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrer ton token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger documentation: http://localhost:3000/api`);
}
bootstrap();