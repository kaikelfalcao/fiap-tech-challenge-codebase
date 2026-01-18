import { Inject, Injectable } from '@nestjs/common';
import { Vehicle } from '@domain/vehicle/vehicle.entity';
import type { VehicleRepository } from '@domain/vehicle/vehicle.repository';
import {
  PaginatedResult,
  PaginationParams,
} from '@shared/pagination/pagination.interface';

@Injectable()
export class ListVehicleUseCase {
  constructor(
    @Inject('VehicleRepository')
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async execute(
    params: PaginationParams = {},
  ): Promise<PaginatedResult<Vehicle>> {
    const page = Math.max(params.page ?? 1, 1);
    const pageSize = Math.max(params.pageSize ?? 20, 1);

    const total = await this.vehicleRepository.count();
    const data = await this.vehicleRepository.findAll({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
