import { Inject, Injectable } from '@nestjs/common';

import { LicensePlate } from '../../../domain/value-objects/license-plate.vo';
import { VehicleId } from '../../../domain/value-objects/vehicle-id.vo';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../domain/vehicle.repository';

import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

export interface UpdateVehicleInput {
  id: string;
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: number;
}

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  async execute(input: UpdateVehicleInput): Promise<void> {
    const vehicle = await this.vehicles.findById(
      VehicleId.fromString(input.id),
    );
    if (!vehicle) {
      throw new NotFoundException('Vehicle', input.id);
    }

    let licensePlate: LicensePlate | undefined;
    if (input.licensePlate) {
      try {
        licensePlate = LicensePlate.create(input.licensePlate);
      } catch (e) {
        throw new ValidationException((e as Error).message);
      }

      const conflict = await this.vehicles.findByLicensePlate(licensePlate);
      if (conflict && conflict.id().value !== vehicle.id().value) {
        throw new ConflictException(
          'A vehicle with this license plate already exists',
        );
      }
    }

    vehicle.changeAttributes({
      licensePlate,
      brand: input.brand,
      model: input.model,
      year: input.year,
    });

    await this.vehicles.update(vehicle);
  }
}
