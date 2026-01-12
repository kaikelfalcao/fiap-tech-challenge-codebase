import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';

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
