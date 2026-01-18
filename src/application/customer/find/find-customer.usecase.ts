import { Customer } from '@domain/customer/customer.entity';
import type { CustomerRepository } from '@domain/customer/customer.repository';
import { Email } from '@domain/customer/email.vo';
import { RegistrationNumber } from '@domain/customer/registration-number.vo';
import { Inject, Injectable } from '@nestjs/common';
import { InvalidInputError } from '@shared/errors/invalid-input.error';
import { NotFoundError } from '@shared/errors/not-found.error';

interface FindCustomerParams {
  id?: string;
  email?: string;
  registrationNumber?: string;
}

@Injectable()
export class FindCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly repository: CustomerRepository,
  ) {}

  async execute(params: FindCustomerParams): Promise<Customer> {
    const { id, email, registrationNumber } = params;

    if (!id && !email && !registrationNumber) {
      throw new InvalidInputError(
        'At least one identifier must be provided (ID, Email or Registration Number)',
      );
    }

    const emailVO = email ? Email.create(email) : null;
    const registrationNumberVO = registrationNumber
      ? RegistrationNumber.create(registrationNumber)
      : null;

    const customer =
      (id && (await this.repository.findById(id))) ||
      (emailVO && (await this.repository.findByEmail(emailVO.value))) ||
      (registrationNumberVO &&
        (await this.repository.findByRegistrationNumber(
          registrationNumberVO.value,
        )));

    if (!customer) throw new NotFoundError('Customer');

    return customer;
  }
}
