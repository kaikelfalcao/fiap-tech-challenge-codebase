import { NotFoundError } from '@shared/errors/not-found.error';
import type { CustomerRepository } from '@domain/customer/customer.repository';
import { Inject, Injectable } from '@nestjs/common';
import { Customer } from '@domain/customer/customer.entity';

interface UpdateCustomerInput {
  id: string;
  name?: string;
  email?: string;
  registrationNumber?: string;
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(input: UpdateCustomerInput): Promise<Customer> {
    const customer = await this.customerRepository.findById(input.id);
    if (!customer) {
      throw new NotFoundError('Customer');
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

    await this.customerRepository.save(customer);

    return customer;
  }
}
