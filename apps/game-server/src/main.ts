import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableCors({ origin: config.get('WEB_ORIGIN', 'http://localhost:5173') });
  await app.listen(config.get('GAME_SERVER_PORT', 3000));
}
await bootstrap();
