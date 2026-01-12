import { UseCase } from '../base.usecase';
import { VehicleRepository } from '../ports/vehicle-repository';
import { Vehicle } from 'src/domain/entities/vehicle.entity';

export class FindAllVehiclesUseCase implements UseCase<void, Vehicle[]> {
  constructor(private readonly repo: VehicleRepository) {}

  async execute(): Promise<Vehicle[]> {
    return this.repo.findAll();
  }
}
