import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../base.usecase';
import type { VehicleRepository } from 'src/domain/repositories/vehicle.repository';

interface DeleteVehicleInput {
  id: string;
}

@Injectable()
export class DeleteVehicleUseCase implements UseCase<DeleteVehicleInput, void> {
  constructor(
    @Inject('VehicleRepository') private readonly repo: VehicleRepository,
  ) {}

  async execute(input: DeleteVehicleInput): Promise<void> {
    const customer = await this.repo.findById(input.id);

    if (!customer) {
      throw new Error('');
    }

    await this.repo.delete(input.id);
  }
}
