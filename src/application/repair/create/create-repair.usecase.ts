import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from '@domain/repair/repair.repository';
import { Repair } from '@domain/repair/repair.entity';

@Injectable()
export class CreateRepairUseCase {
  constructor(
    @Inject('RepairRepository')
    private readonly repairRepository: RepairRepository,
  ) {}

  async execute(input: { description: string; cost: number }): Promise<Repair> {
    const repair = Repair.create(input.description, input.cost);
    await this.repairRepository.save(repair);
    return repair;
  }
}
