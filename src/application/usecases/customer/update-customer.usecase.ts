import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from 'src/application/base.usecase';
import type { CustomerRepository } from 'src/domain/repositories/customer.repository';
import { Customer } from 'src/domain/entities/customer.entity';
import { FindCustomerUseCase } from './find-customer.usecase';

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
    private readonly findUseCase: FindCustomerUseCase,
  ) {}

  async execute(input: UpdateCustomerInput): Promise<Customer> {
    const customer = await this.findUseCase.execute({ id: input.id });

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
