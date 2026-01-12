import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../base.usecase';
import { Vehicle } from 'src/domain/entities/vehicle.entity';
import type { VehicleRepository } from 'src/domain/repositories/vehicle.repository';

@Injectable()
export class FindAllVehiclesUseCase implements UseCase<void, Vehicle[]> {
  constructor(
    @Inject('VehicleRepository') private readonly repo: VehicleRepository,
  ) {}

  async execute(): Promise<Vehicle[]> {
    return this.repo.findAll();
  }
}
