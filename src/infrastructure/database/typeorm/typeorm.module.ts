import { ConfigModule } from '@infrastructure/config/config.module';
import { ConfigService } from '@infrastructure/config/config.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.postgres.host,
        port: config.postgres.port,
        username: config.postgres.user,
        password: config.postgres.password,
        database: config.postgres.database,
        autoLoadEntities: true,
        synchronize: config.isProduction() ? false : true,
      }),
    }),
  ],
})
export class DatabaseModule {}
