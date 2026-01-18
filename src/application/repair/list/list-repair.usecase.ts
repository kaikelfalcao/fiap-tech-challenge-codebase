import { Inject, Injectable } from '@nestjs/common';
import type { RepairRepository } from '@domain/repair/repair.repository';
import { Repair } from '@domain/repair/repair.entity';
import {
  PaginatedResult,
  PaginationParams,
} from '@shared/pagination/pagination.interface';

@Injectable()
export class ListRepairUseCase {
  constructor(
    @Inject('RepairRepository')
    private readonly repairRepository: RepairRepository,
  ) {}

  async execute(
    params: PaginationParams = {},
  ): Promise<PaginatedResult<Repair>> {
    const page = Math.max(params.page ?? 1, 1);
    const pageSize = Math.max(params.pageSize ?? 20, 1);

    const total = await this.repairRepository.count();
    const data = await this.repairRepository.findAll({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
