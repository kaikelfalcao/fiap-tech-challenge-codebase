import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from 'src/domain/repositories/repair.repository';
import { Repair } from 'src/domain/entities/repair.entity';

@Injectable()
export class FindAllRepairsUseCase {
  constructor(
    @Inject('RepairRepository') private readonly repo: RepairRepository,
  ) {}

  async execute(): Promise<Repair[]> {
    return await this.repo.findAll();
  }
}
