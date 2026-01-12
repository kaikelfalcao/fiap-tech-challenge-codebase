import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from 'src/application/base.usecase';
import type { CustomerRepository } from 'src/application/ports/customer.repository';
import { Customer } from 'src/domain/entities/customer.entity';
import { CustomerNotFound } from 'src/domain/errors/customer-not-found.error';

interface UpdateCustomerInput {
  id: string;
  name?: string;
  email?: string;
  registrationNumber?: string;
}

@Injectable()
export class UpdateCustomerUseCase implements UseCase<
  UpdateCustomerInput,
  Customer
> {
  constructor(
    @Inject('CustomerRepository') private readonly repo: CustomerRepository,
  ) {}

  async execute(input: UpdateCustomerInput): Promise<Customer> {
    const customer = await this.repo.findById(input.id);

    if (!customer) {
      throw new CustomerNotFound();
    }

    if (input.name) {
      customer.changeName(input.name);
    }

    if (input.email) {
      customer.changeEmail(input.email);
    }

    if (input.registrationNumber) {
      customer.changeRegistrationNumber(input.registrationNumber);
    }

    await this.repo.save(customer);

    return customer;
  }
}
