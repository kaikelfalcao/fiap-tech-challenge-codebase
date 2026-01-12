import { Vehicle } from 'src/domain/entities/vehicle.entity';
import { UseCase } from '../base.usecase';
import { VehicleRepository } from '../ports/vehicle-repository';
import { Plate } from 'src/domain/value-objects/plate.vo';

interface FindVehicleInput {
  id?: string;
  plate?: string;
}

export class FindVehicleUseCase implements UseCase<
  FindVehicleInput,
  Vehicle | null
> {
  constructor(private readonly repo: VehicleRepository) {}

  async execute(input: FindVehicleInput): Promise<Vehicle | null> {
    if (!input.id && !input.plate) {
      throw new Error('At least one identifier (id or plate) must be provided');
    }

    if (input.id) {
      const vehicle = await this.repo.findById(input.id);
      if (vehicle) {
        return vehicle;
      }
    }

    if (input.plate) {
      const plateVO = Plate.create(input.plate);
      const vehicle = await this.repo.findByPlate(plateVO.value);
      if (vehicle) {
        return vehicle;
      }
    }

    return null;
  }
}
