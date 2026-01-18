import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from '@domain/repair/repair.repository';
import { Repair } from '@domain/repair/repair.entity';
import { NotFoundError } from '@shared/errors/not-found.error';

@Injectable()
export class FindRepairUseCase {
  constructor(
    @Inject('RepairRepository')
    private readonly repairRepository: RepairRepository,
  ) {}

  async execute(input: { id: string }): Promise<Repair> {
    const repair = await this.repairRepository.findById(input.id);
    if (!repair) throw new NotFoundError('Repair');

    return repair;
  }
}
