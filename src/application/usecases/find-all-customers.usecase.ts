import { UseCase } from '../base.usecase';
import { Customer } from 'src/domain/entities/customer.entity';
import { CustomerRepository } from '../ports/customer-repository';

export class FindAllCustomersUseCase implements UseCase<void, Customer[]> {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(): Promise<Customer[]> {
    return this.repo.findAll();
  }
}
