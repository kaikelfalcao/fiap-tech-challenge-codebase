import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleRepository } from 'src/application/ports/vehicle.repository';
import { CreateVehicleUseCase } from 'src/application/usecases/create-vehicle.usecase';
import { DeleteVehicleUseCase } from 'src/application/usecases/delete-vehicle.usecase';
import { FindAllVehiclesUseCase } from 'src/application/usecases/find-all-vehicles.usecase';
import { FindVehicleUseCase } from 'src/application/usecases/find-vehicle.usecase';
import { UpdateVehicleUseCase } from 'src/application/usecases/update-vehicle.usecase';
import { VehicleOrm } from 'src/infra/typeorm/entities/vehicle.orm';
import { TypeOrmVehicleRepository } from 'src/infra/typeorm/repositories/typeorm-vehicle.repository';
import { VehicleController } from 'src/interface/http/vehicle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleOrm])],
  controllers: [VehicleController],
  providers: [
    {
      provide: 'VehicleRepository',
      useClass: TypeOrmVehicleRepository,
    },
    {
      provide: CreateVehicleUseCase,
      useFactory: (repo: VehicleRepository) => new CreateVehicleUseCase(repo),
      inject: ['VehicleRepository'],
    },
    {
      provide: FindAllVehiclesUseCase,
      useFactory: (repo: VehicleRepository) => new FindAllVehiclesUseCase(repo),
      inject: ['VehicleRepository'],
    },
    {
      provide: FindVehicleUseCase,
      useFactory: (repo: VehicleRepository) => new FindVehicleUseCase(repo),
      inject: ['VehicleRepository'],
    },
    {
      provide: UpdateVehicleUseCase,
      useFactory: (repo: VehicleRepository) => new UpdateVehicleUseCase(repo),
      inject: ['VehicleRepository'],
    },
    {
      provide: DeleteVehicleUseCase,
      useFactory: (repo: VehicleRepository) => new DeleteVehicleUseCase(repo),
      inject: ['VehicleRepository'],
    },
  ],
})
export class VehicleModule {}
