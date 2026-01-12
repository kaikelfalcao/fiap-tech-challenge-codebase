import { Vehicle } from 'src/domain/entities/vehicle.entity';
import { UseCase } from '../base.usecase';
import { VehicleRepository } from '../ports/vehicle.repository';
import { VehicleNotFound } from 'src/domain/errors/vehicle-not-found.error';

interface UpdateVehicleInput {
  id: string;
  brand?: string;
  model?: string;
  year?: number;
  plate?: string;
}

export class UpdateVehicleUseCase implements UseCase<
  UpdateVehicleInput,
  Vehicle
> {
  constructor(private readonly repo: VehicleRepository) {}

  async execute(input: UpdateVehicleInput): Promise<Vehicle> {
    const vehicle = await this.repo.findById(input.id);

    if (!vehicle) {
      throw new VehicleNotFound();
    }

    if (input.brand) {
      vehicle.changeBrand(input.brand);
    }

    if (input.model) {
      vehicle.changeModel(input.model);
    }

    if (input.year !== undefined) {
      vehicle.changeYear(input.year);
    }

    if (input.plate) {
      vehicle.changePlate(input.plate);
    }

    await this.repo.save(vehicle);

    return vehicle;
  }
}
