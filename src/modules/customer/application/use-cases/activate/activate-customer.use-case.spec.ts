import { makeCustomer, UUID_1 } from '../../helpers/customer.factory';
import type { CustomerRepositoryMock } from '../../helpers/repository.mock';
import { makeRepositoryMock } from '../../helpers/repository.mock';

import { ActivateCustomerUseCase } from './activate-customer.use-case';

describe('ActivateCustomerUseCase', () => {
  let sut: ActivateCustomerUseCase;
  let repo: CustomerRepositoryMock;

  beforeEach(() => {
    repo = makeRepositoryMock();
    sut = new ActivateCustomerUseCase(repo);
  });

  it('should activate an inactive customer', async () => {
    const customer = makeCustomer({ active: false });
    repo.findById.mockResolvedValue(customer);
    repo.update.mockResolvedValue();

    await sut.execute({ id: UUID_1 });

    expect(customer.active).toBe(true);
  });

  it('should call update with the activated customer', async () => {
    const customer = makeCustomer({ active: false });
    repo.findById.mockResolvedValue(customer);
    repo.update.mockResolvedValue();

    await sut.execute({ id: UUID_1 });

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(customer);
  });

  it('should still call update even if customer is already active', async () => {
    const customer = makeCustomer({ active: true });
    repo.findById.mockResolvedValue(customer);
    repo.update.mockResolvedValue();

    await sut.execute({ id: UUID_1 });

    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should call findById with the correct id', async () => {
    const customer = makeCustomer({ active: false });
    repo.findById.mockResolvedValue(customer);
    repo.update.mockResolvedValue();

    await sut.execute({ id: UUID_1 });

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(UUID_1);
  });

  it('should throw if customer is not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: UUID_1 })).rejects.toThrow(
      'Customer not found',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not call update when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ id: UUID_1 })).rejects.toThrow('Database error');
    expect(repo.update).not.toHaveBeenCalled();
  });
});
