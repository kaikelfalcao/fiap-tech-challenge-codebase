import { Customer } from 'src/domain/entities/customer.entity';
import { UseCase } from '../base.usecase';
import { CustomerRepository } from '../ports/customer.repository';
import { Email } from 'src/domain/value-objects/email.vo';
import { RegistrationNumber } from 'src/domain/value-objects/registration-number.vo';

interface FindCustomerInput {
  id?: string;
  email?: string;
  registrationNumber?: string;
}

export class FindCustomerUseCase implements UseCase<
  FindCustomerInput,
  Customer | null
> {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(input: FindCustomerInput): Promise<Customer | null> {
    if (!input.id && !input.email && !input.registrationNumber) {
      throw new Error('At least one identifier must be provided');
    }

    if (input.id) {
      const customer = await this.repo.findById(input.id);
      if (customer) {
        return customer;
      }
    }

    if (input.email) {
      const email = Email.create(input.email);
      const customer = await this.repo.findByEmail(email.value);
      if (customer) {
        return customer;
      }
    }

    if (input.registrationNumber) {
      const registrationNumber = RegistrationNumber.create(
        input.registrationNumber,
      );
      const customer = await this.repo.findByRegistrationNumber(
        registrationNumber.value,
      );
      if (customer) {
        return customer;
      }
    }

    return null;
  }
}
