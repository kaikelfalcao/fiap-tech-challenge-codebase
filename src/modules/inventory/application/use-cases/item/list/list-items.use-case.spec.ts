import type { ItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { makeItemRepositoryMock } from '../../../helpers/item-repository.mock';
import {
  ITEM_UUID_2,
  ITEM_UUID_3,
  makeItem,
  makeItemCode,
  makeItemId,
} from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStock } from '../../../helpers/stock.factory';

import { ListItemsUseCase } from './list-items.use-case';

import type { Item } from '@/modules/inventory/domain/item.entity';
import type { PaginatedResult } from '@/modules/inventory/domain/item.repository';

const makePaginatedResult = (
  data: Item[],
  overrides: Partial<PaginatedResult<Item>> = {},
): PaginatedResult<Item> => ({
  data,
  total: data.length,
  page: 1,
  limit: 20,
  ...overrides,
});

describe('ListItemsUseCase', () => {
  let sut: ListItemsUseCase;
  let itemRepo: ItemRepositoryMock;
  let stockRepo: StockRepositoryMock;

  beforeEach(() => {
    itemRepo = makeItemRepositoryMock();
    stockRepo = makeStockRepositoryMock();
    sut = new ListItemsUseCase(itemRepo, stockRepo);
    stockRepo.findByItemId.mockResolvedValue(makeStock());
  });

  it('should return a paginated list of items', async () => {
    const items = [
      makeItem(),
      makeItem({ id: makeItemId(ITEM_UUID_2), code: makeItemCode('PART-002') }),
    ];
    itemRepo.list.mockResolvedValue(makePaginatedResult(items));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(2);
    expect(output.total).toBe(2);
    expect(output.page).toBe(1);
    expect(output.limit).toBe(20);
  });

  it('should map each item to the output shape', async () => {
    const item = makeItem();
    itemRepo.list.mockResolvedValue(makePaginatedResult([item]));

    const output = await sut.execute({});
    const result = output.data[0];

    expect(result.id).toBe(item.id().value);
    expect(result.code).toBe(item.code.value);
    expect(result.name).toBe(item.name);
    expect(result.type).toBe(item.type);
    expect(result.unit).toBe(item.unit);
    expect(result.unitPriceCents).toBe(item.unitPrice.cents);
    expect(result.active).toBe(item.active);
    expect(result.createdAt).toBe(item.createdAt);
    expect(result.updatedAt).toBe(item.updatedAt);
  });

  it('should return stock data for each item', async () => {
    const item = makeItem();
    const stock = makeStock({ quantity: 50, reserved: 10, minimum: 5 });
    itemRepo.list.mockResolvedValue(makePaginatedResult([item]));
    stockRepo.findByItemId.mockResolvedValue(stock);

    const output = await sut.execute({});

    expect(output.data[0].stock).not.toBeNull();
    expect(output.data[0].stock?.quantity).toBe(50);
    expect(output.data[0].stock?.reserved).toBe(10);
    expect(output.data[0].stock?.available).toBe(40);
    expect(output.data[0].stock?.minimum).toBe(5);
    expect(output.data[0].stock?.isBelowMinimum).toBe(false);
  });

  it('should return stock = null when no stock exists for an item', async () => {
    itemRepo.list.mockResolvedValue(makePaginatedResult([makeItem()]));
    stockRepo.findByItemId.mockResolvedValue(null);

    const output = await sut.execute({});

    expect(output.data[0].stock).toBeNull();
  });

  it('should return isBelowMinimum = true when available <= minimum', async () => {
    itemRepo.list.mockResolvedValue(makePaginatedResult([makeItem()]));
    stockRepo.findByItemId.mockResolvedValue(
      makeStock({ quantity: 5, reserved: 2, minimum: 5 }),
    );

    const output = await sut.execute({});

    expect(output.data[0].stock?.available).toBe(3);
    expect(output.data[0].stock?.isBelowMinimum).toBe(true);
  });

  it('should forward filters to the repository', async () => {
    itemRepo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({ type: 'SUPPLY', active: false, page: 2, limit: 10 });

    expect(itemRepo.list).toHaveBeenCalledWith({
      type: 'SUPPLY',
      active: false,
      page: 2,
      limit: 10,
    });
  });

  it('should return empty list when no items exist', async () => {
    itemRepo.list.mockResolvedValue(makePaginatedResult([], { total: 0 }));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(0);
    expect(output.total).toBe(0);
  });

  it('should preserve pagination metadata from repository', async () => {
    itemRepo.list.mockResolvedValue(
      makePaginatedResult([makeItem()], { total: 80, page: 4, limit: 10 }),
    );

    const output = await sut.execute({ page: 4, limit: 10 });

    expect(output.total).toBe(80);
    expect(output.page).toBe(4);
    expect(output.limit).toBe(10);
  });

  it('should include formatted unit price', async () => {
    itemRepo.list.mockResolvedValue(makePaginatedResult([makeItem()]));

    const output = await sut.execute({});

    expect(output.data[0].unitPriceFormatted).toContain('R$');
  });

  it('should call findByItemId for each item returned', async () => {
    const items = [
      makeItem(),
      makeItem({ id: makeItemId(ITEM_UUID_2), code: makeItemCode('PART-002') }),
      makeItem({ id: makeItemId(ITEM_UUID_3), code: makeItemCode('PART-003') }),
    ];
    itemRepo.list.mockResolvedValue(makePaginatedResult(items));

    await sut.execute({});

    expect(stockRepo.findByItemId).toHaveBeenCalledTimes(3);
  });

  it('should throw if repository throws', async () => {
    itemRepo.list.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({})).rejects.toThrow('Database error');
  });
});
