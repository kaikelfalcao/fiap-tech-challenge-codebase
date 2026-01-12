import { UseCase } from '../base.usecase';
import { VehicleRepository } from '../ports/vehicle-repository';

interface DeleteVehicleInput {
  id: string;
}

export class DeleteVehicleUseCase implements UseCase<DeleteVehicleInput, void> {
  constructor(private readonly repo: VehicleRepository) {}

  async execute(input: DeleteVehicleInput): Promise<void> {
    const customer = await this.repo.findById(input.id);

    if (!customer) {
      throw new Error('');
    }

    await this.repo.delete(input.id);
  }
}
