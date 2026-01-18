import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Taxifun API')
    .setDescription("API REST pour la plateforme Taxi-Fun - Gestion des courses et itinéraires")
    .setVersion('1.0')
    .addTag('Authentication', 'Endpoints d\'authentification (Client & Driver)')
    .addTag('Routes', 'Construction manuelle d\'itinéraires (Driver only)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez le token JWT reçu lors de la connexion',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);


  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
