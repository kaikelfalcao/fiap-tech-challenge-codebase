import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from 'src/application/base.usecase';
import type { CustomerRepository } from 'src/application/ports/customer.repository';
import { CustomerNotFound } from 'src/domain/errors/customer-not-found.error';

interface DeleteCustomerInput {
  id: string;
}

@Injectable()
export class DeleteCustomerUseCase implements UseCase<
  DeleteCustomerInput,
  void
> {
  constructor(
    @Inject('CustomerRepository')
    private readonly repo: CustomerRepository,
  ) {}

  async execute(input: DeleteCustomerInput): Promise<void> {
    const customer = await this.repo.findById(input.id);

    if (!customer) {
      throw new CustomerNotFound();
    }

    await this.repo.delete(input.id);
  }
}
