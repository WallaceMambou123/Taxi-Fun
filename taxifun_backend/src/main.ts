import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CONFIGURATION SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('TAXIFUN API')
    .setDescription('Documentation de l\'API CRUD avec Prisma et PostgreSQL')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // L'URL sera /api

  // --- FIX BIGINT POUR JSON ---
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  await app.listen(3000);
  console.log(`Application running on: http://localhost:3000`);
  console.log(`Swagger docs available on: http://localhost:3000/api`);
}
bootstrap();