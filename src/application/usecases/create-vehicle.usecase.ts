import { Vehicle } from 'src/domain/entities/vehicle.entity';
import { UseCase } from '../base.usecase';
import { VehicleRepository } from '../ports/vehicle-repository';

interface CreateVehicleInput {
  brand: string;
  model: string;
  year: number;
  plate: string;
  customerId: string;
}

export class CreateVehicleUseCase implements UseCase<
  CreateVehicleInput,
  Vehicle
> {
  constructor(private readonly repo: VehicleRepository) {}

  async execute(input: CreateVehicleInput): Promise<Vehicle> {
    const vehicle = Vehicle.create(
      input.brand,
      input.model,
      input.year,
      input.plate,
      input.customerId,
    );

    await this.repo.save(vehicle);

    return vehicle;
  }
}
