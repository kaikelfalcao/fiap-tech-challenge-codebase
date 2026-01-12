import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infra/typeorm/typeorm.module';
import { CustomerModule } from './infra/nestjs/modules/customer.module';
import { VehicleModule } from './infra/nestjs/modules/vehicle.module';

@Module({
  imports: [ConfigModule, DatabaseModule, CustomerModule, VehicleModule],
})
export class AppModule {}
