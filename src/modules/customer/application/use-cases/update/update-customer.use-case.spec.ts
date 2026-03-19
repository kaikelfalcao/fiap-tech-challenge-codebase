import { makeCustomer, UUID_1 } from '../../helpers/customer.factory';
import type { CustomerRepositoryMock } from '../../helpers/repository.mock';
import { makeRepositoryMock } from '../../helpers/repository.mock';

import { UpdateCustomerUseCase } from './update-customer.use-case';

const makeInput = (overrides = {}) => ({
  id: UUID_1,
  fullName: 'Jane Doe',
  phone: '(11) 98888-1111',
  email: 'jane@doe.com',
  ...overrides,
});

describe('UpdateCustomerUseCase', () => {
  let sut: UpdateCustomerUseCase;
  let repo: CustomerRepositoryMock;

  beforeEach(() => {
    repo = makeRepositoryMock();
    sut = new UpdateCustomerUseCase(repo);
  });

  it('should update all provided attributes', async () => {
    const customer = makeCustomer();
    repo.findById.mockResolvedValue(customer);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(customer.fullName).toBe('Jane Doe');
    expect(customer.phone).toBe('(11) 98888-1111');
    expect(customer.email.getValue()).toBe('jane@doe.com');
  });

  it('should call update with the modified customer', async () => {
    const customer = makeCustomer();
    repo.findById.mockResolvedValue(customer);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(customer);
  });

  it('should update only the provided fields', async () => {
    const customer = makeCustomer({ phone: '(71) 99999-0000' });
    const originalPhone = customer.phone;
    const originalEmail = customer.email.getValue();
    repo.findById.mockResolvedValue(customer);
    repo.update.mockResolvedValue();

    await sut.execute({ id: UUID_1, fullName: 'Jane Doe' });

    expect(customer.fullName).toBe('Jane Doe');
    expect(customer.phone).toBe(originalPhone);
    expect(customer.email.getValue()).toBe(originalEmail);
  });

  it('should call findById with the correct id', async () => {
    const customer = makeCustomer();
    repo.findById.mockResolvedValue(customer);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput({ id: UUID_1 }));

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(UUID_1);
  });

  it('should throw if customer is not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(
      'Customer not found',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw if email is invalid', async () => {
    const customer = makeCustomer();
    repo.findById.mockResolvedValue(customer);

    await expect(
      sut.execute(makeInput({ email: 'not-an-email' })),
    ).rejects.toThrow();

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not call update when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.update).not.toHaveBeenCalled();
  });
});
