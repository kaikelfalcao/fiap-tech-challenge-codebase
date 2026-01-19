import { Vehicle } from '@domain/vehicle/vehicle.entity';
import { Plate } from '@domain/vehicle/plate.vo';
import { Inject, Injectable } from '@nestjs/common';
import type { VehicleRepository } from '@domain/vehicle/vehicle.repository';
import { InvalidInputError } from '@shared/errors/invalid-input.error';
import { NotFoundError } from '@shared/errors/not-found.error';

interface FindVehicleInput {
  id?: string;
  plate?: string;
}

@Injectable()
export class FindVehicleUseCase {
  constructor(
    @Inject('VehicleRepository')
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async execute(input: FindVehicleInput): Promise<Vehicle> {
    if (!input.id && !input.plate) {
      throw new InvalidInputError(
        'At least one identifier (id or plate) must be provided',
      );
    }

    if (input.id) {
      const vehicle = await this.vehicleRepository.findById(input.id);
      if (vehicle) {
        return vehicle;
      }
    }

    if (input.plate) {
      const plateVO = Plate.create(input.plate);
      const vehicle = await this.vehicleRepository.findByPlate(plateVO.value);
      if (vehicle) {
        return vehicle;
      }
    }

    throw new NotFoundError('Vehicle');
  }
}
