import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from 'src/domain/repositories/repair.repository';
import { Repair } from 'src/domain/entities/repair.entity';

@Injectable()
export class FindRepairUseCase {
  constructor(
    @Inject('RepairRepository') private readonly repo: RepairRepository,
  ) {}

  async execute(input: { id: string }): Promise<Repair | null> {
    return await this.repo.findById(input.id);
  }
}
