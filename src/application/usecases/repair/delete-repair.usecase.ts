import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from 'src/domain/repositories/repair.repository';

@Injectable()
export class DeleteRepairUseCase {
  constructor(
    @Inject('RepairRepository') private readonly repo: RepairRepository,
  ) {}

  async execute(input: { id: string }): Promise<void> {
    const repair = await this.repo.findById(input.id);
    if (!repair) throw new Error('Repair not found');

    await this.repo.delete(input.id);
  }
}
