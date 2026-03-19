import { Inject, Injectable } from '@nestjs/common';

import { VehicleId } from '../../../domain/value-objects/vehicle-id.vo';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../domain/vehicle.repository';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface DeleteVehicleInput {
  id: string;
}

@Injectable()
export class DeleteVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  async execute(input: DeleteVehicleInput): Promise<void> {
    const vehicle = await this.vehicles.findById(
      VehicleId.fromString(input.id),
    );
    if (!vehicle) {
      throw new NotFoundException('Vehicle', input.id);
    }

    vehicle.ensureCanBeDeleted();

    await this.vehicles.delete(vehicle.id() as VehicleId);
  }
}
