import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@infrastructure/database/typeorm/typeorm.module';
import { VehicleModule } from '@interface/http/controllers/vehicle/vehicle.module';
import { PartModule } from '@interface/http/controllers/part/part.module';
import { RepairModule } from '@interface/http/controllers/repair/repair.module';
import { ServiceOrderModule } from '@infrastructure/nestjs/modules/service-order.module';
import { AuthModule } from '@infrastructure/auth/auth.module';
import { HealthModule } from '@interface/http/controllers/health/health.module';
import { CustomerModule } from '@interface/http/controllers/customer/customer.module';

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
