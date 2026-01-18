import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@infrastructure/database/typeorm/typeorm.module';
import { VehicleModule } from '@infrastructure/nestjs/modules/vehicle.module';
import { PartModule } from '@infrastructure/nestjs/modules/part.module';
import { RepairModule } from '@infrastructure/nestjs/modules/repair.module';
import { ServiceOrderModule } from '@infrastructure/nestjs/modules/service-order.module';
import { AuthModule } from '@infrastructure/auth/auth.module';
import { HealthModule } from '@infrastructure/nestjs/modules/health.module';
import { CustomerModule } from '@interface/http/customers/customer.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CustomerModule,
    VehicleModule,
    PartModule,
    RepairModule,
    ServiceOrderModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
