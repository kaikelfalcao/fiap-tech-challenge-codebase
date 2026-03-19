import type { ItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { makeItemRepositoryMock } from '../../../helpers/item-repository.mock';
import {
  ITEM_UUID_2,
  makeItem,
  makeItemCode,
  makeItemId,
} from '../../../helpers/item.factory';

import { ListItemsUseCase } from './list-items.use-case';

import type { PaginatedResult } from '@/modules/customer/domain/customer.repository';
import type { Item } from '@/modules/inventory/domain/item.entity';

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
  let repo: ItemRepositoryMock;

  beforeEach(() => {
    repo = makeItemRepositoryMock();
    sut = new ListItemsUseCase(repo);
  });

  it('should return a paginated list of items', async () => {
    const items = [
      makeItem(),
      makeItem({ id: makeItemId(ITEM_UUID_2), code: makeItemCode('PART-002') }),
    ];
    repo.list.mockResolvedValue(makePaginatedResult(items));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(2);
    expect(output.total).toBe(2);
    expect(output.page).toBe(1);
    expect(output.limit).toBe(20);
  });

  it('should map each item to the output shape', async () => {
    const item = makeItem();
    repo.list.mockResolvedValue(makePaginatedResult([item]));

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

  it('should forward filters to the repository', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({ type: 'SUPPLY', active: false, page: 2, limit: 10 });

    expect(repo.list).toHaveBeenCalledWith({
      type: 'SUPPLY',
      active: false,
      page: 2,
      limit: 10,
    });
  });

  it('should return empty list when no items exist', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([], { total: 0 }));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(0);
    expect(output.total).toBe(0);
  });

  it('should preserve pagination metadata from repository', async () => {
    repo.list.mockResolvedValue(
      makePaginatedResult([makeItem()], { total: 80, page: 4, limit: 10 }),
    );

    const output = await sut.execute({ page: 4, limit: 10 });

    expect(output.total).toBe(80);
    expect(output.page).toBe(4);
    expect(output.limit).toBe(10);
  });

  it('should include formatted unit price', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([makeItem()]));

    const output = await sut.execute({});

    expect(output.data[0].unitPriceFormatted).toContain('R$');
  });

  it('should throw if repository throws', async () => {
    repo.list.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({})).rejects.toThrow('Database error');
  });
});
