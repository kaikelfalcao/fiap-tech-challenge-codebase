import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from '../../../domain/entities/customer.entity';
import { CUSTOMER_REPOSITORY } from '../../../infrastructure/nest/modules/tokens';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository';
import { Span } from 'nestjs-otel';
import { UseCase } from '../../base.usecase';

@Injectable()
export class GetCustomerByEmailUseCase extends UseCase<string, Customer> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly repo: ICustomerRepository,
  ) {
    super();
  }

  @Span()
  async execute(email: string): Promise<Customer> {
    const found = await this.repo.findByEmail(email);
    if (!found) throw new NotFoundException('Customer not found');
    return found;
  }
}
