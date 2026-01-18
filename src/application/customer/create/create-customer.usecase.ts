import { Inject, Injectable } from '@nestjs/common';
import { Customer } from '@domain/customer/customer.entity';
import type { CustomerRepository } from '@domain/customer/customer.repository';
import { CustomerAlreadyExistsError } from '../errors/customerAlreadyExists.error';

export interface CreateCustomerInput {
  name: string;
  email: string;
  registrationNumber: string;
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}
  async handle(input: CreateCustomerInput): Promise<Customer> {
    const customer = Customer.create(
      input.name,
      input.email,
      input.registrationNumber,
    );

    if (
      (await this.customerRepository.findByEmail(customer.email.value)) ||
      (await this.customerRepository.findByRegistrationNumber(
        customer.registrationNumber.value,
      ))
    ) {
      throw new CustomerAlreadyExistsError();
    }

    await this.customerRepository.save(customer);

    return customer;
  }
}
