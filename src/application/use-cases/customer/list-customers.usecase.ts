import { Inject, Injectable } from '@nestjs/common';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../../infrastructure/nest/modules/tokens';
import { Customer } from '../../../domain/entities/customer.entity';
import { UseCase } from '../../base.usecase';
import { Span } from 'nestjs-otel';

@Injectable()
export class ListCustomersUseCase extends UseCase<void, Customer[]> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly repo: ICustomerRepository,
  ) {
    super();
  }

  @Span()
  async execute(): Promise<Customer[]> {
    return this.repo.findAll();
  }
}
