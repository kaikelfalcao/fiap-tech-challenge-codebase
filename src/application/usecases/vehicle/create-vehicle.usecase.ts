import { Vehicle } from 'src/domain/entities/vehicle.entity';
import { UseCase } from '../../base.usecase';
import type { VehicleRepository } from '../../ports/vehicle.repository';
import { Inject, Injectable } from '@nestjs/common';

interface CreateVehicleInput {
  brand: string;
  model: string;
  year: number;
  plate: string;
  customerId: string;
}

@Injectable()
export class CreateVehicleUseCase implements UseCase<
  CreateVehicleInput,
  Vehicle
> {
  constructor(
    @Inject('VehicleRepository') private readonly repo: VehicleRepository,
  ) {}

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
