import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from './shared/infrastructure/config/app.config';
import authConfig from './shared/infrastructure/config/auth.config';
import databaseConfig from './shared/infrastructure/config/database.config';
import { envSchema } from './shared/infrastructure/config/env.schema';

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
  ],
})
export class AppModule {}
