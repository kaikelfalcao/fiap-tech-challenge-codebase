import { Customer } from '@domain/customer/customer.entity';
import type { CustomerRepository } from '@domain/customer/customer.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
  PaginatedResult,
  PaginationParams,
} from '@shared/pagination/pagination.interface';

@Injectable()
export class ListCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    params: PaginationParams = {},
  ): Promise<PaginatedResult<Customer>> {
    const page = Math.max(params.page ?? 1, 1);
    const pageSize = Math.max(params.pageSize ?? 20, 1);

    const total = await this.customerRepository.count();
    const data = await this.customerRepository.findAll({
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
