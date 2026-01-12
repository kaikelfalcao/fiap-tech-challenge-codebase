import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from 'src/domain/repositories/repair.repository';
import { Repair } from 'src/domain/entities/repair.entity';

@Injectable()
export class CreateRepairUseCase {
  constructor(
    @Inject('RepairRepository') private readonly repo: RepairRepository,
  ) {}

  async execute(input: { description: string; cost: number }): Promise<Repair> {
    const repair = Repair.create(input.description, input.cost);
    await this.repo.save(repair);
    return repair;
  }
}
