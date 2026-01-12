import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from 'src/application/base.usecase';
import type { CustomerRepository } from 'src/application/ports/customer.repository';
import { Customer } from 'src/domain/entities/customer.entity';
import { Email } from 'src/domain/value-objects/email.vo';
import { RegistrationNumber } from 'src/domain/value-objects/registration-number.vo';

interface FindCustomerInput {
  id?: string;
  email?: string;
  registrationNumber?: string;
}

@Injectable()
export class FindCustomerUseCase implements UseCase<
  FindCustomerInput,
  Customer | null
> {
  constructor(
    @Inject('CustomerRepository')
    private readonly repository: CustomerRepository,
  ) {}

  async execute(input: FindCustomerInput): Promise<Customer | null> {
    if (!input.id && !input.email && !input.registrationNumber) {
      throw new Error('At least one identifier must be provided');
    }

    if (input.id) {
      const customer = await this.repository.findById(input.id);
      if (customer) {
        return customer;
      }
    }

    if (input.email) {
      const email = Email.create(input.email);
      const customer = await this.repository.findByEmail(email.value);
      if (customer) {
        return customer;
      }
    }

    if (input.registrationNumber) {
      const registrationNumber = RegistrationNumber.create(
        input.registrationNumber,
      );
      const customer = await this.repository.findByRegistrationNumber(
        registrationNumber.value,
      );
      if (customer) {
        return customer;
      }
    }

    return null;
  }
}
