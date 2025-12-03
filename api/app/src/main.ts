import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // فعال کردن CORS برای اتصال از Tauri
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'tauri://localhost',
      'https://tauri.localhost',
      'http://localhost:1420',
      'http://127.0.0.1:1420',
      'tauri://localhost',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // اعتبارسنجی ورودی‌ها
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // پیشوند API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 API is running on: http://localhost:${port}`);
}

bootstrap();
