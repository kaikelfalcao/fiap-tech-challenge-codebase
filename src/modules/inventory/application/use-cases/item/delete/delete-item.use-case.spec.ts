import type { ItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { makeItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { ITEM_UUID_1, makeItem } from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';

import { DeleteItemUseCase } from './delete-item.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('DeleteItemUseCase', () => {
  let sut: DeleteItemUseCase;
  let itemRepo: ItemRepositoryMock;
  let stockRepo: StockRepositoryMock;

  beforeEach(() => {
    itemRepo = makeItemRepositoryMock();
    stockRepo = makeStockRepositoryMock();
    sut = new DeleteItemUseCase(itemRepo, stockRepo);
  });

  it('should delete stock before item', async () => {
    const item = makeItem({ active: false });
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.deleteByItemId.mockResolvedValue();
    itemRepo.delete.mockResolvedValue();

    await sut.execute({ id: ITEM_UUID_1 });

    const stockDeleteOrder =
      stockRepo.deleteByItemId.mock.invocationCallOrder[0];
    const itemDeleteOrder = itemRepo.delete.mock.invocationCallOrder[0];
    expect(stockDeleteOrder).toBeLessThan(itemDeleteOrder);
  });

  it('should delete an inactive item and its stock', async () => {
    const item = makeItem({ active: false });
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.deleteByItemId.mockResolvedValue();
    itemRepo.delete.mockResolvedValue();

    await sut.execute({ id: ITEM_UUID_1 });

    expect(stockRepo.deleteByItemId).toHaveBeenCalledWith(item.id().value);
    expect(itemRepo.delete).toHaveBeenCalledTimes(1);
  });

  it('should call ensureCanBeDeleted before deleting', async () => {
    const item = makeItem({ active: false });
    const spy = jest.spyOn(item, 'ensureCanBeDeleted');
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.deleteByItemId.mockResolvedValue();
    itemRepo.delete.mockResolvedValue();

    await sut.execute({ id: ITEM_UUID_1 });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should throw BusinessRuleException when item is active', async () => {
    const item = makeItem({ active: true });
    itemRepo.findById.mockResolvedValue(item);

    await expect(sut.execute({ id: ITEM_UUID_1 })).rejects.toThrow(
      BusinessRuleException,
    );
    expect(stockRepo.deleteByItemId).not.toHaveBeenCalled();
    expect(itemRepo.delete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if item does not exist', async () => {
    itemRepo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: ITEM_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(stockRepo.deleteByItemId).not.toHaveBeenCalled();
    expect(itemRepo.delete).not.toHaveBeenCalled();
  });

  it('should not delete item when stock deletion throws', async () => {
    const item = makeItem({ active: false });
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.deleteByItemId.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ id: ITEM_UUID_1 })).rejects.toThrow(
      'Database error',
    );
    expect(itemRepo.delete).not.toHaveBeenCalled();
  });
});
