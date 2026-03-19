import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  makeSOItem,
  makeServiceOrderWithStatus,
  SO_UUID_1,
  ITEM_UUID_1,
} from '../../helpers/service-order.factory';

import { RemoveItemFromOrderUseCase } from './remove-item-from-order.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

describe('RemoveItemFromOrderUseCase', () => {
  let sut: RemoveItemFromOrderUseCase;
  let repo: SORepositoryMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    sut = new RemoveItemFromOrderUseCase(repo);
  });

  it('should remove an item from the order', async () => {
    const order = makeServiceOrder({ items: [makeSOItem()] });
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1, itemId: ITEM_UUID_1 });

    expect(order.items).toHaveLength(0);
  });

  it('should call update with the modified order', async () => {
    const order = makeServiceOrder({ items: [makeSOItem()] });
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1, itemId: ITEM_UUID_1 });

    expect(repo.update).toHaveBeenCalledWith(order);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      sut.execute({ orderId: SO_UUID_1, itemId: ITEM_UUID_1 }),
    ).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if item not in order', async () => {
    repo.findById.mockResolvedValue(makeServiceOrder({ items: [] }));

    await expect(
      sut.execute({ orderId: SO_UUID_1, itemId: ITEM_UUID_1 }),
    ).rejects.toThrow(ValidationException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if order is not editable', async () => {
    const order = makeServiceOrderWithStatus('IN_EXECUTION', {
      items: [makeSOItem()],
    });
    repo.findById.mockResolvedValue(order);

    await expect(
      sut.execute({ orderId: SO_UUID_1, itemId: ITEM_UUID_1 }),
    ).rejects.toThrow(ValidationException);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
