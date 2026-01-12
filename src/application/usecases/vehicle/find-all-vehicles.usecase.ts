import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../base.usecase';
import type { VehicleRepository } from '../../ports/vehicle.repository';
import { Vehicle } from 'src/domain/entities/vehicle.entity';

@Injectable()
export class FindAllVehiclesUseCase implements UseCase<void, Vehicle[]> {
  constructor(
    @Inject('VehicleRepository') private readonly repo: VehicleRepository,
  ) {}

  async execute(): Promise<Vehicle[]> {
    return this.repo.findAll();
  }
}
