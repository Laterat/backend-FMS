import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Enable CORS BEFORE listening
  app.enableCors({
    origin: ['http://localhost:5173', 'https://fms-frontend-beta.vercel.app'], // local dev + production frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // needed if you use cookies or auth headers
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // bind to all network interfaces

  console.log(`Server is running on port ${port}`);
}
bootstrap();
