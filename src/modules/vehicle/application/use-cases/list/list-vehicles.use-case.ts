import { Inject, Injectable } from '@nestjs/common';

import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
  PaginatedResult,
} from '../../../domain/vehicle.repository';
import type { GetVehicleOutput } from '../get/get-vehicle.use-case';

export interface ListVehiclesInput {
  customerId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListVehiclesUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  async execute(
    input: ListVehiclesInput,
  ): Promise<PaginatedResult<GetVehicleOutput>> {
    const result = await this.vehicles.list(input);

    return {
      ...result,
      data: result.data.map((vehicle) => ({
        id: vehicle.id().value,
        customerId: vehicle.customerId,
        licensePlate: vehicle.licensePlate.formatted,
        licensePlateType: vehicle.licensePlate.type,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
      })),
    };
  }
}
