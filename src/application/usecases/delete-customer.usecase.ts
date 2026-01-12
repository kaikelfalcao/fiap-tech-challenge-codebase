import { CustomerNotFound } from 'src/domain/errors/customer-not-found.error';
import { UseCase } from '../base.usecase';
import { CustomerRepository } from '../ports/customer.repository';

interface DeleteCustomerInput {
  id: string;
}

export class DeleteCustomerUseCase implements UseCase<
  DeleteCustomerInput,
  void
> {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(input: DeleteCustomerInput): Promise<void> {
    const customer = await this.repo.findById(input.id);

    if (!customer) {
      throw new CustomerNotFound();
    }

    await this.repo.delete(input.id);
  }
}
