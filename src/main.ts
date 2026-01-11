import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './infra/config/config.service';
import { GlobalExceptionFilter } from './infra/nestjs/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(config.app.port);
}
bootstrap();
