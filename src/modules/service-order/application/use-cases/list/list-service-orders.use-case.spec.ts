import type { ServiceOrder } from '../../../domain/service-order.entity';
import type { PaginatedResult } from '../../../domain/service-order.repository';
import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  makeServiceOrderId,
  SO_UUID_2,
} from '../../helpers/service-order.factory';

import { ListServiceOrdersUseCase } from './list-service-orders.use-case';

const makePaginatedResult = (
  data: ServiceOrder[],
  overrides: Partial<PaginatedResult<ServiceOrder>> = {},
): PaginatedResult<ServiceOrder> => ({
  data,
  total: data.length,
  page: 1,
  limit: 20,
  ...overrides,
});

describe('ListServiceOrdersUseCase', () => {
  let sut: ListServiceOrdersUseCase;
  let repo: SORepositoryMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    sut = new ListServiceOrdersUseCase(repo);
  });

  it('should return a paginated list of orders', async () => {
    const orders = [
      makeServiceOrder(),
      makeServiceOrder({ id: makeServiceOrderId(SO_UUID_2) }),
    ];
    repo.list.mockResolvedValue(makePaginatedResult(orders));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(2);
    expect(output.total).toBe(2);
    expect(output.page).toBe(1);
    expect(output.limit).toBe(20);
  });

  it('should always exclude FINALIZED and DELIVERED from listing', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({});

    const [filters] = repo.list.mock.calls[0];
    expect(filters.excludeStatuses).toContain('FINALIZED');
    expect(filters.excludeStatuses).toContain('DELIVERED');
  });

  it('should forward customerId and vehicleId filters', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({
      customerId: 'b1b2b3b4-0001-4000-8000-000000000001',
      vehicleId: 'c1c2c3c4-0001-4000-8000-000000000001',
      page: 2,
      limit: 10,
    });

    const [filters] = repo.list.mock.calls[0];
    expect(filters.customerId).toBe('b1b2b3b4-0001-4000-8000-000000000001');
    expect(filters.vehicleId).toBe('c1c2c3c4-0001-4000-8000-000000000001');
    expect(filters.page).toBe(2);
    expect(filters.limit).toBe(10);
  });

  it('should map each order to the output shape with statusLabel', async () => {
    const order = makeServiceOrder({ status: 'RECEIVED' });
    repo.list.mockResolvedValue(makePaginatedResult([order]));

    const output = await sut.execute({});

    expect(output.data[0].statusLabel).toBe('Recebida');
    expect(output.data[0].id).toBe(order.id().value);
  });

  it('should preserve pagination metadata from repository', async () => {
    repo.list.mockResolvedValue(
      makePaginatedResult([makeServiceOrder()], {
        total: 50,
        page: 3,
        limit: 10,
      }),
    );

    const output = await sut.execute({ page: 3, limit: 10 });

    expect(output.total).toBe(50);
    expect(output.page).toBe(3);
    expect(output.limit).toBe(10);
  });

  it('should throw if repository throws', async () => {
    repo.list.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({})).rejects.toThrow('Database error');
  });
});
