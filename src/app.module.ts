import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infra/typeorm/typeorm.module';
import { CustomerModule } from './infra/nestjs/modules/customer.module';

@Module({
  imports: [ConfigModule, DatabaseModule, CustomerModule],
})
export class AppModule {}
