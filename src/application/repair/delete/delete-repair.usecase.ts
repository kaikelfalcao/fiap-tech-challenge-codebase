import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from '@domain/repair/repair.repository';
import { NotFoundError } from '@shared/errors/not-found.error';

@Injectable()
export class DeleteRepairUseCase {
  constructor(
    @Inject('RepairRepository')
    private readonly repairRepository: RepairRepository,
  ) {}

  async execute(input: { id: string }): Promise<void> {
    const repair = await this.repairRepository.findById(input.id);
    if (!repair) throw new NotFoundError('Repair');

    await this.repairRepository.delete(input.id);
  }
}
