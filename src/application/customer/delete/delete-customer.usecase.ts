import type { CustomerRepository } from '@domain/customer/customer.repository';
import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '@shared/errors/not-found.error';

interface DeleteCustomerInput {
  id: string;
}

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(input: DeleteCustomerInput): Promise<void> {
    const exists = await this.customerRepository.findById(input.id);
    if (!exists) {
      throw new NotFoundError('Customer');
    }

    await this.customerRepository.delete(input.id);
  }
}
