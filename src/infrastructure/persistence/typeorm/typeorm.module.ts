import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

const getTypeOrmModuleOptions = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('POSTGRES_HOST'),
  port: Number(config.get<string>('POSTGRES_PORT')),
  username: config.get<string>('POSTGRES_USER'),
  password: config.get<string>('POSTGRES_PASSWORD'),
  database: config.get<string>('POSTGRES_DB'),
  entities: [__dirname + '/../../**/*.entity.{ts,js}'],
  synchronize: true,
  ssl:
    config.get<string>('POSTGRES_SSL') === 'true'
      ? { rejectUnauthorized: false }
      : false,
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmModuleOptions,
    }),
  ],
})
export class TypeOrmConfigModule {}
