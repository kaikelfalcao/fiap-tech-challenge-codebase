import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from 'src/application/ports/repair.repository';
import { Repair } from 'src/domain/entities/repair.entity';

@Injectable()
export class UpdateRepairUseCase {
  constructor(
    @Inject('RepairRepository') private readonly repo: RepairRepository,
  ) {}

  async execute(input: {
    id: string;
    description?: string;
    cost?: number;
  }): Promise<Repair> {
    const repair = await this.repo.findById(input.id);
    if (!repair) throw new Error('Repair not found');

    if (input.description) repair.changeDescription(input.description);
    if (input.cost !== undefined) repair.changeCost(input.cost);

    await this.repo.update(repair);
    return repair;
  }
}
