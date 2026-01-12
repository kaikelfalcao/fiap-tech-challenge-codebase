import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infra/typeorm/typeorm.module';
import { CustomerModule } from './infra/nestjs/modules/customer.module';
import { VehicleModule } from './infra/nestjs/modules/vehicle.module';
import { PartModule } from './infra/nestjs/modules/part.module';
import { RepairModule } from './infra/nestjs/modules/repair.module';
import { ServiceOrderModule } from './infra/nestjs/modules/service-order.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CustomerModule,
    VehicleModule,
    PartModule,
    RepairModule,
    ServiceOrderModule,
  ],
})
export class AppModule {}
