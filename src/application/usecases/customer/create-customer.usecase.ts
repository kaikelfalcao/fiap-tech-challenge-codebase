import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from 'src/application/base.usecase';
import type { CustomerRepository } from 'src/application/ports/customer.repository';
import { Customer } from 'src/domain/entities/customer.entity';

import { CustomerAlreadyExistsError } from 'src/domain/errors/customer-already-exists.error';

interface CreateCustomerInput {
  name: string;
  email: string;
  registrationNumber: string;
}

@Injectable()
export class CreateCustomerUseCase implements UseCase<
  CreateCustomerInput,
  Customer
> {
  constructor(
    @Inject('CustomerRepository') private readonly repo: CustomerRepository,
  ) {}

  async execute(input: CreateCustomerInput): Promise<Customer> {
    const customer = Customer.create(
      input.name,
      input.email,
      input.registrationNumber,
    );

    if (
      (await this.repo.findByEmail(customer.email.value)) ||
      (await this.repo.findByRegistrationNumber(
        customer.registrationNumber.value,
      ))
    ) {
      throw new CustomerAlreadyExistsError();
    }

    await this.repo.save(customer);

    return customer;
  }
}
