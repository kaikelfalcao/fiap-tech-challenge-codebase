import { Vehicle } from 'src/domain/entities/vehicle.entity';
import { UseCase } from '../../base.usecase';
import { Inject, Injectable } from '@nestjs/common';
import type { VehicleRepository } from 'src/domain/repositories/vehicle.repository';

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
