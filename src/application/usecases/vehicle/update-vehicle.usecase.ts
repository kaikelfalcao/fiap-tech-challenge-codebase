import { Vehicle } from 'src/domain/entities/vehicle.entity';
import { UseCase } from '../../base.usecase';
import type { VehicleRepository } from '../../ports/vehicle.repository';
import { VehicleNotFound } from 'src/domain/errors/vehicle-not-found.error';
import { Inject, Injectable } from '@nestjs/common';

interface UpdateVehicleInput {
  id: string;
  brand?: string;
  model?: string;
  year?: number;
  plate?: string;
}

@Injectable()
export class UpdateVehicleUseCase implements UseCase<
  UpdateVehicleInput,
  Vehicle
> {
  constructor(
    @Inject('VehicleRepository') private readonly repo: VehicleRepository,
  ) {}

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
