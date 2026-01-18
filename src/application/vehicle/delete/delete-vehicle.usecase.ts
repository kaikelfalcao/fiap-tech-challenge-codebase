import { Inject, Injectable } from '@nestjs/common';
import type { VehicleRepository } from '@domain/vehicle/vehicle.repository';
import { NotFoundError } from '@shared/errors/not-found.error';

interface DeleteVehicleInput {
  id: string;
}

@Injectable()
export class DeleteVehicleUseCase {
  constructor(
    @Inject('VehicleRepository')
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async execute(input: DeleteVehicleInput): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(input.id);

    if (!vehicle) {
      throw new NotFoundError('Vehicle');
    }

    await this.vehicleRepository.delete(input.id);
  }
}
