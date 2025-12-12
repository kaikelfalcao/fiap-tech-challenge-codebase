import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { otelSDK } from './infrastructure/telemetry/otel';

otelSDK.start();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
