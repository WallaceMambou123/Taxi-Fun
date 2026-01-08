// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  // En production, tu pourras remplacer '*' par l'URL de ton frontend Render
  app.enableCors({
    origin: '*', 
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuration Swagger
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

  // --- MODIFICATION CRUCIALE POUR RENDER ---
  // On utilise process.env.PORT car Render assigne un port aléatoire
  // On ajoute '0.0.0.0' pour accepter les connexions externes
  const port = process.env.PORT || 3000;
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  
  console.log(`Application is running on port: ${port}`);
  console.log(`Swagger documentation: /api`);
}
bootstrap();