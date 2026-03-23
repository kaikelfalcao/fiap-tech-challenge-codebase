import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CatalogModule } from './modules/catalog/catalog.module';
import { CustomerModule } from './modules/customer/customer.module';
import { IamModule } from './modules/iam/iam.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ServiceOrderModule } from './modules/service-order/service-order.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import appConfig from './shared/infrastructure/config/app.config';
import authConfig from './shared/infrastructure/config/auth.config';
import databaseConfig from './shared/infrastructure/config/database.config';
import { envSchema } from './shared/infrastructure/config/env.schema';
import { HealthModule } from './shared/infrastructure/health/health.module';
import { MetricsInterceptor } from './shared/infrastructure/interceptors/metrics.interceptor';
import { LoggerModule } from './shared/infrastructure/logger/logger.module';
import { MetricsModule } from './shared/infrastructure/metrics/metrics.module';
import { RequestLoggerMiddleware } from './shared/infrastructure/middleware/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, appConfig, databaseConfig],

      ignoreEnvFile: process.env.NODE_ENV === 'production',

      validationSchema: envSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get('NODE_ENV') === 'production';

        return {
          type: 'postgres',

          host: isProd
            ? configService.get<string>('database.host')
            : 'localhost',
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.user'),
          password: configService.get<string>('database.pass'),
          database: configService.get<string>('database.name'),
          ssl: isProd ? { rejectUnauthorized: false } : false,

          autoLoadEntities: true,

          migrations: [
            isProd
              ? 'dist/src/modules/**/infrastructure/persistence/migrations/*.js'
              : 'src/modules/**/infrastructure/persistence/migrations/*.ts',
          ],

          migrationsRun: false,
          synchronize: false,

          logging: !isProd,
        };
      },
    }),
    CustomerModule,
    VehicleModule,
    InventoryModule,
    CatalogModule,
    ServiceOrderModule,
    IamModule,
    HealthModule,
    LoggerModule,
    MetricsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
