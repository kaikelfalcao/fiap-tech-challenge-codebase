import { VehicleOrm } from '@infrastructure/database/typeorm/entities/vehicle.orm';
import { TypeOrmVehicleRepository } from '@infrastructure/database/typeorm/repositories/typeorm-vehicle.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateVehicleUseCase } from 'src/application/usecases/vehicle/create-vehicle.usecase';
import { DeleteVehicleUseCase } from 'src/application/usecases/vehicle/delete-vehicle.usecase';
import { FindAllVehiclesUseCase } from 'src/application/usecases/vehicle/find-all-vehicles.usecase';
import { FindVehicleUseCase } from 'src/application/usecases/vehicle/find-vehicle.usecase';
import { UpdateVehicleUseCase } from 'src/application/usecases/vehicle/update-vehicle.usecase';
import { VehicleController } from 'src/interface/http/vehicle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleOrm])],
  controllers: [VehicleController],
  providers: [
    { provide: 'VehicleRepository', useClass: TypeOrmVehicleRepository },
    CreateVehicleUseCase,
    FindAllVehiclesUseCase,
    FindVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
  exports: [FindVehicleUseCase, 'VehicleRepository'],
})
export class VehicleModule {}
