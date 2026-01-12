import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from 'src/domain/repositories/repair.repository';

export interface GetRepairInput {
  repairId: string;
}

export interface GetRepairOutput {
  processed: Array<{
    repairId: string;
    costAtTime: number;
  }>;
  totalCost: number;
}

@Injectable()
export class GetRepairsUseCase {
  constructor(
    @Inject('RepairRepository') private readonly repository: RepairRepository,
  ) {}

  async execute(repairs: GetRepairInput[]): Promise<GetRepairOutput> {
    const processed: GetRepairOutput['processed'] = [];
    let totalCost = 0;

    for (const item of repairs) {
      const repair = await this.repository.findById(item.repairId);
      if (!repair) {
        throw new Error(`Reparo ${item.repairId} não encontrado`);
      }

      processed.push({
        repairId: repair.id,
        costAtTime: repair.cost,
      });

      totalCost += repair.cost;
    }

    return { processed, totalCost };
  }
}
