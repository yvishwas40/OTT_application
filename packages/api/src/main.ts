import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Enable CORS for CMS frontend
//   app.enableCors({
//     origin: ['http://localhost:3001', process.env.CMS_URL || 'http://localhost:3001'],
//     credentials: true,
//   });

//   // Global validation pipe
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }),
//   );

//   // API prefix
//   app.setGlobalPrefix('api');

//   // Swagger documentation
//   const config = new DocumentBuilder()
//     .setTitle('OTT CMS API')
//     .setDescription('Production-grade OTT Content Management System API')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();
  
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document);

//   const port = process.env.PORT || 3000;
//   await app.listen(port);
//   console.log(`🚀 API server running on http://localhost:${port}`);
//   console.log(`📖 API documentation available at http://localhost:${port}/api/docs`);
// }

// bootstrap();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ✅ Force OPTIONS to succeed (CRITICAL)
  app.getHttpAdapter().getInstance().options('*', (req, res) => {
    res.sendStatus(204);
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
}