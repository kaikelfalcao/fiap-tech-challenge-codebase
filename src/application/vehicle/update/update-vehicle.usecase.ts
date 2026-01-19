import { Vehicle } from '@domain/vehicle/vehicle.entity';
import { VehicleNotFound } from '@domain/vehicle/vehicle-not-found.error';
import { Inject, Injectable } from '@nestjs/common';
import type { VehicleRepository } from '@domain/vehicle/vehicle.repository';

interface UpdateVehicleInput {
  id: string;
  brand?: string;
  model?: string;
  year?: number;
  plate?: string;
}

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject('VehicleRepository')
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async execute(input: UpdateVehicleInput): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(input.id);

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

    await this.vehicleRepository.save(vehicle);

    return vehicle;
  }
}
