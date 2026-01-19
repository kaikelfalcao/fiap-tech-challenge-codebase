import { Vehicle } from '@domain/vehicle/vehicle.entity';
import { Inject, Injectable } from '@nestjs/common';
import type { VehicleRepository } from '@domain/vehicle/vehicle.repository';

interface CreateVehicleInput {
  brand: string;
  model: string;
  year: number;
  plate: string;
  customerId: string;
}

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    @Inject('VehicleRepository')
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async execute(input: CreateVehicleInput): Promise<Vehicle> {
    const vehicle = Vehicle.create(
      input.brand,
      input.model,
      input.year,
      input.plate,
      input.customerId,
    );

    await this.vehicleRepository.save(vehicle);

    return vehicle;
  }
}
