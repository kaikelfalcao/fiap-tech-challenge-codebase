import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
  ],
})
export class AppModule {}
