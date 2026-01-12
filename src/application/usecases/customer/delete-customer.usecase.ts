import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from 'src/application/base.usecase';
import type { CustomerRepository } from 'src/application/ports/customer.repository';
import { FindCustomerUseCase } from './find-customer.usecase';

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
    private readonly findUseCase: FindCustomerUseCase,
  ) {}

  async execute(input: DeleteCustomerInput): Promise<void> {
    const customer = await this.findUseCase.execute({ id: input.id });
    await this.repo.delete(customer?.id);
  }
}
