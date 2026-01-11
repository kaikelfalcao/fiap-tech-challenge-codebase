import { Customer } from 'src/domain/entities/customer.entity';
import { UseCase } from '../base.usecase';
import { CustomerRepository } from '../ports/customer-repository';
import { CustomerNotFound } from 'src/domain/errors/customer-not-found.error';

interface UpdateCustomerInput {
  id: string;
  name?: string;
  email?: string;
  registrationNumber?: string;
}

export class UpdateCustomerUseCase implements UseCase<
  UpdateCustomerInput,
  Customer
> {
  constructor(private readonly repo: CustomerRepository) {}

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
