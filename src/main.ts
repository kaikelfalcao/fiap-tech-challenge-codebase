import 'newrelic';
import 'dotenv/config';
import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './infrastructure/config/config.service';
import { GlobalExceptionFilter } from './interface/http/filters/global-exception.filter';
import { AdvancedLoggingInterceptor } from './interface/http/interceptors/advanced-logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger as winstonLogger } from './infrastructure/logging/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useLogger(winstonLogger);

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new AdvancedLoggingInterceptor());

  const configSwagger = new DocumentBuilder()
    .setTitle('Tech Challenge – Service Order API')
    .setDescription(
      `
API para gestão de clientes, veículos, peças, reparos e ordens de serviço.

Esta API permite:
- Autenticação via JWT
- Cadastro e consulta de clientes e veículos
- Controle de peças e reparos
- Criação e atualização de ordens de serviço
- Aprovação ou rejeição de ordens via link por e-mail
- Consulta pública de ordens por cliente + veículo

⚠️ Rotas protegidas exigem token JWT no header Authorization: Bearer <token>.
`,
    )
    .setVersion('1.0.5')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Ambiente local')
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(config.app.port);
  winstonLogger.info(
    `🚀 Application started successfully on port ${config.app.port}`,
  );
  winstonLogger.info(
    `📚 Swagger Docs available at http://localhost:${config.app.port}/docs`,
  );
  winstonLogger.info('🔗 New Relic Logs integration enabled');
}
bootstrap().catch((err) => {
  winstonLogger.error('Failed to start application:', err);
  process.exit(1);
});
