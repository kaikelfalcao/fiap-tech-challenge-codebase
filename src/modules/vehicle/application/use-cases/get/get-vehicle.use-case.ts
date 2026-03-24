import { Inject, Injectable } from '@nestjs/common';

import { VehicleId } from '../../../domain/value-objects/vehicle-id.vo';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../domain/vehicle.repository';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface GetVehicleInput {
  id: string;
}

export interface GetVehicleOutput {
  id: string;
  customerId: string;
  licensePlate: string;
  licensePlateType: 'old' | 'mercosul';
  brand: string;
  model: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  async execute(input: GetVehicleInput): Promise<GetVehicleOutput> {
    const vehicle = await this.vehicles.findById(
      VehicleId.fromString(input.id),
    );
    if (!vehicle) {
      throw new NotFoundException('Vehicle', input.id);
    }

    return {
      id: vehicle.id().value,
      customerId: vehicle.customerId,
      licensePlate: vehicle.licensePlate.formatted,
      licensePlateType: vehicle.licensePlate.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }
}
