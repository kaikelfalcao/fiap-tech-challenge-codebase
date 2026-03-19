import type { ServiceOrder } from '../../../domain/service-order.entity';
import type { PaginatedResult } from '../../../domain/service-order.repository';
import {
  makeCustomerApiMock,
  makeCustomerView,
  type CustomerApiMock,
} from '../../helpers/external-apis.mock';
import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  makeServiceOrderWithStatus,
  makeServiceOrderId,
  SO_UUID_2,
  CUSTOMER_UUID,
} from '../../helpers/service-order.factory';

import { ListServiceOrdersByTaxIdUseCase } from './list-service-orders-by-taxid.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

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

describe('ListServiceOrdersByTaxIdUseCase', () => {
  let sut: ListServiceOrdersByTaxIdUseCase;
  let repo: SORepositoryMock;
  let customerApi: CustomerApiMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    customerApi = makeCustomerApiMock();
    sut = new ListServiceOrdersByTaxIdUseCase(repo, customerApi);
  });

  it('should return all orders for the customer including finalized and delivered', async () => {
    const orders = [
      makeServiceOrder({ status: 'RECEIVED' }),
      makeServiceOrderWithStatus('FINALIZED', {
        id: makeServiceOrderId(SO_UUID_2),
      }),
    ];
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    repo.list.mockResolvedValue(makePaginatedResult(orders));

    const output = await sut.execute({ taxId: '52998224725' });

    expect(output.data).toHaveLength(2);
  });

  it('should NOT pass excludeStatuses filter', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    repo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({ taxId: '52998224725' });

    const [filters] = repo.list.mock.calls[0];
    expect(filters.excludeStatuses).toBeUndefined();
  });

  it('should filter by the resolved customerId', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    repo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({ taxId: '52998224725' });

    const [filters] = repo.list.mock.calls[0];
    expect(filters.customerId).toBe(CUSTOMER_UUID);
  });

  it('should forward page and limit', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    repo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({ taxId: '52998224725', page: 2, limit: 5 });

    const [filters] = repo.list.mock.calls[0];
    expect(filters.page).toBe(2);
    expect(filters.limit).toBe(5);
  });

  it('should throw NotFoundException if customer is not found', async () => {
    customerApi.getByTaxId.mockResolvedValue(null);

    await expect(sut.execute({ taxId: '52998224725' })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.list).not.toHaveBeenCalled();
  });

  it('should not call repo when customerApi throws', async () => {
    customerApi.getByTaxId.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ taxId: '52998224725' })).rejects.toThrow(
      'Database error',
    );
    expect(repo.list).not.toHaveBeenCalled();
  });
});
