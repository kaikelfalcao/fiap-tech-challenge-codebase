import { Part } from '@domain/part/part.entity';
import type { PartRepository } from '@domain/part/part.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
  PaginatedResult,
  PaginationParams,
} from '@shared/pagination/pagination.interface';

@Injectable()
export class ListPartUseCase {
  constructor(
    @Inject('PartRepository') private partRepository: PartRepository,
  ) {}

  async execute(params: PaginationParams = {}): Promise<PaginatedResult<Part>> {
    const page = Math.max(params.page ?? 1, 1);
    const pageSize = Math.max(params.pageSize ?? 20, 1);

    const total = await this.partRepository.count();
    const data = await this.partRepository.findAll({
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
