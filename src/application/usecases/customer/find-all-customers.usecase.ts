import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from 'src/application/base.usecase';
import type { CustomerRepository } from 'src/domain/repositories/customer.repository';
import { Customer } from 'src/domain/entities/customer.entity';

@Injectable()
export class FindAllCustomersUseCase implements UseCase<void, Customer[]> {
  constructor(
    @Inject('CustomerRepository') private readonly repo: CustomerRepository,
  ) {}

  async execute(): Promise<Customer[]> {
    return this.repo.findAll();
  }
}
