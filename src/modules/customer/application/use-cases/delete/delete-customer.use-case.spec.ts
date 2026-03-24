import { makeCustomer, UUID_1 } from '../../helpers/customer.factory';
import {
  makeRepositoryMock,
  type CustomerRepositoryMock,
} from '../../helpers/repository.mock';

import { DeleteCustomerUseCase } from './delete-customer.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('DeleteCustomerUseCase', () => {
  let sut: DeleteCustomerUseCase;
  let repo: CustomerRepositoryMock;

  beforeEach(() => {
    repo = makeRepositoryMock();
    sut = new DeleteCustomerUseCase(repo);
  });

  it('should delete an inactive customer', async () => {
    const customer = makeCustomer({ active: false });
    repo.findById.mockResolvedValue(customer);
    repo.delete.mockResolvedValue();

    await sut.execute({ id: UUID_1 });

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith(customer.id());
  });

  it('should call findById with the correct id', async () => {
    const customer = makeCustomer({ active: false });
    repo.findById.mockResolvedValue(customer);
    repo.delete.mockResolvedValue();

    await sut.execute({ id: UUID_1 });

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(UUID_1);
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException if customer is active', async () => {
    const customer = makeCustomer({ active: true });
    repo.findById.mockResolvedValue(customer);

    await expect(sut.execute({ id: UUID_1 })).rejects.toThrow(
      BusinessRuleException,
    );
    await expect(sut.execute({ id: UUID_1 })).rejects.toThrow(
      'Cannot delete an active customer. Deactivate it first.',
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should not call delete when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ id: UUID_1 })).rejects.toThrow('Database error');
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
