import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Debug: log Authorization header on every incoming request to detect phantom tokens
  app.use((req, _res, next) => {
    try {
      console.log('Incoming Authorization header:', req.headers?.authorization);
    } catch (e) {
      // ignore
    }
    next();
  });

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

  app.enableCors({
    origin: '*', // En développement, on autorise tout. 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
  console.log(`Application running on: http://localhost:3000`);
  console.log(`Swagger docs available on: http://localhost:3000/api`);
}
bootstrap();