import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeleteVehicleUseCase } from './application/use-cases/delete/delete-vehicle.use-case';
import { GetVehicleUseCase } from './application/use-cases/get/get-vehicle.use-case';
import { ListVehiclesUseCase } from './application/use-cases/list/list-vehicles.use-case';
import { RegisterVehicleUseCase } from './application/use-cases/register/register-vehicle.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update/update-vehicle.use-case';
import { VEHICLE_REPOSITORY } from './domain/vehicle.repository';
import { VehicleOrmEntity } from './infrastructure/persistence/vehicle.typeorm.entity';
import { VehicleTypeOrmRepository } from './infrastructure/persistence/vehicle.typeorm.repository';
import { VehicleController } from './presentation/http/vehicle.controller';
import { VEHICLE_PUBLIC_API } from './public/vehicle.public-api';
import { VehiclePublicApiService } from './public/vehicle.public-api.service';

import { CustomerModule } from '@/modules/customer/customer.module';

const USE_CASES = [
  RegisterVehicleUseCase,
  UpdateVehicleUseCase,
  DeleteVehicleUseCase,
  GetVehicleUseCase,
  ListVehiclesUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([VehicleOrmEntity]), CustomerModule],
  controllers: [VehicleController],
  providers: [
    { provide: VEHICLE_REPOSITORY, useClass: VehicleTypeOrmRepository },
    ...USE_CASES,
    { provide: VEHICLE_PUBLIC_API, useClass: VehiclePublicApiService },
  ],
  exports: [VEHICLE_PUBLIC_API],
})
export class VehicleModule {}
