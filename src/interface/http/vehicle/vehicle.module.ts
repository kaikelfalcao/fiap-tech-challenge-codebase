import { VehicleOrm } from '@infrastructure/database/typeorm/entities/vehicle.orm';
import { TypeOrmVehicleRepository } from '@infrastructure/database/typeorm/repositories/typeorm-vehicle.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateVehicleUseCase } from '@application/vehicle/create/create-vehicle.usecase';
import { DeleteVehicleUseCase } from '@application/vehicle/delete/delete-vehicle.usecase';
import { ListVehicleUseCase } from '@application/vehicle/list/list-vehicle.usecase';
import { FindVehicleUseCase } from '@application/vehicle/find/find-vehicle.usecase';
import { UpdateVehicleUseCase } from '@application/vehicle/update/update-vehicle.usecase';
import { VehicleController } from '@interface/http/vehicle/vehicle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleOrm])],
  controllers: [VehicleController],
  providers: [
    { provide: 'VehicleRepository', useClass: TypeOrmVehicleRepository },
    CreateVehicleUseCase,
    ListVehicleUseCase,
    FindVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
  exports: [FindVehicleUseCase, 'VehicleRepository'],
})
export class VehicleModule {}
