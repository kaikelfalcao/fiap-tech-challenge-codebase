import type { ItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { makeItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { ITEM_UUID_1, makeItem } from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStock } from '../../../helpers/stock.factory';

import { GetItemUseCase } from './get-item.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('GetItemUseCase', () => {
  let sut: GetItemUseCase;
  let itemRepo: ItemRepositoryMock;
  let stockRepo: StockRepositoryMock;

  beforeEach(() => {
    itemRepo = makeItemRepositoryMock();
    stockRepo = makeStockRepositoryMock();
    sut = new GetItemUseCase(itemRepo, stockRepo);
  });

  it('should return item output with stock data', async () => {
    const item = makeItem();
    const stock = makeStock({ quantity: 50, reserved: 10, minimum: 5 });
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.findByItemId.mockResolvedValue(stock);

    const output = await sut.execute({ id: ITEM_UUID_1 });

    expect(output.id).toBe(item.id().value);
    expect(output.code).toBe(item.code.value);
    expect(output.name).toBe(item.name);
    expect(output.type).toBe(item.type);
    expect(output.unit).toBe(item.unit);
    expect(output.unitPriceCents).toBe(item.unitPrice.cents);
    expect(output.active).toBe(item.active);
  });

  it('should return formatted unit price', async () => {
    const item = makeItem();
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.findByItemId.mockResolvedValue(makeStock());

    const output = await sut.execute({ id: ITEM_UUID_1 });

    expect(output.unitPriceFormatted).toContain('R$');
  });

  it('should return correct stock computed fields', async () => {
    const item = makeItem();
    const stock = makeStock({ quantity: 50, reserved: 10, minimum: 5 });
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.findByItemId.mockResolvedValue(stock);

    const output = await sut.execute({ id: ITEM_UUID_1 });

    expect(output.stock?.quantity).toBe(50);
    expect(output.stock?.reserved).toBe(10);
    expect(output.stock?.available).toBe(40);
    expect(output.stock?.minimum).toBe(5);
    expect(output.stock?.isBelowMinimum).toBe(false);
  });

  it('should return isBelowMinimum = true when available <= minimum', async () => {
    const item = makeItem();
    const stock = makeStock({ quantity: 5, reserved: 2, minimum: 5 });
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.findByItemId.mockResolvedValue(stock);

    const output = await sut.execute({ id: ITEM_UUID_1 });

    expect(output.stock?.available).toBe(3);
    expect(output.stock?.isBelowMinimum).toBe(true);
  });

  it('should return stock = null when no stock exists', async () => {
    const item = makeItem();
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.findByItemId.mockResolvedValue(null);

    const output = await sut.execute({ id: ITEM_UUID_1 });

    expect(output.stock).toBeNull();
  });

  it('should call findById with the correct ItemId', async () => {
    const item = makeItem();
    itemRepo.findById.mockResolvedValue(item);
    stockRepo.findByItemId.mockResolvedValue(makeStock());

    await sut.execute({ id: ITEM_UUID_1 });

    const [calledId] = itemRepo.findById.mock.calls[0];
    expect(calledId.value).toBe(ITEM_UUID_1);
  });

  it('should throw NotFoundException if item does not exist', async () => {
    itemRepo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: ITEM_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
  });
});
