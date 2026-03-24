import type { Service } from '../../../domain/service.entity';
import type { PaginatedResult } from '../../../domain/service.repository';
import {
  makeServiceRepositoryMock,
  type ServiceRepositoryMock,
} from '../../helpers/service-repository.mock';
import {
  makeService,
  makeServiceId,
  makeServiceCode,
  SERVICE_UUID_2,
} from '../../helpers/service.factory';

import { ListServicesUseCase } from './list-services.use-case';

const makePaginatedResult = (
  data: Service[],
  overrides: Partial<PaginatedResult<Service>> = {},
): PaginatedResult<Service> => ({
  data,
  total: data.length,
  page: 1,
  limit: 20,
  ...overrides,
});

describe('ListServicesUseCase', () => {
  let sut: ListServicesUseCase;
  let repo: ServiceRepositoryMock;

  beforeEach(() => {
    repo = makeServiceRepositoryMock();
    sut = new ListServicesUseCase(repo);
  });

  it('should return a paginated list of services', async () => {
    const services = [
      makeService(),
      makeService({
        id: makeServiceId(SERVICE_UUID_2),
        code: makeServiceCode('SVC-002'),
      }),
    ];
    repo.list.mockResolvedValue(makePaginatedResult(services));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(2);
    expect(output.total).toBe(2);
    expect(output.page).toBe(1);
    expect(output.limit).toBe(20);
  });

  it('should map each service to the output shape', async () => {
    const service = makeService();
    repo.list.mockResolvedValue(makePaginatedResult([service]));

    const output = await sut.execute({});
    const item = output.data[0];

    expect(item.id).toBe(service.id().value);
    expect(item.code).toBe(service.code.value);
    expect(item.name).toBe(service.name);
    expect(item.description).toBe(service.description);
    expect(item.basePriceCents).toBe(service.basePrice.cents);
    expect(item.estimatedDurationMinutes).toBe(
      service.estimatedDuration.minutes,
    );
    expect(item.active).toBe(service.active);
    expect(item.createdAt).toBe(service.createdAt);
    expect(item.updatedAt).toBe(service.updatedAt);
  });

  it('should return formatted price and duration', async () => {
    const service = makeService();
    repo.list.mockResolvedValue(makePaginatedResult([service]));

    const output = await sut.execute({});

    expect(output.data[0].basePriceFormatted).toContain('R$');
    expect(output.data[0].estimatedDurationFormatted).toBeDefined();
  });

  it('should forward filters to the repository', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({ active: true, page: 2, limit: 10 });

    expect(repo.list).toHaveBeenCalledWith({
      active: true,
      page: 2,
      limit: 10,
    });
  });

  it('should return empty list when no services exist', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([], { total: 0 }));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(0);
    expect(output.total).toBe(0);
  });

  it('should preserve pagination metadata from repository', async () => {
    repo.list.mockResolvedValue(
      makePaginatedResult([makeService()], { total: 42, page: 3, limit: 10 }),
    );

    const output = await sut.execute({ page: 3, limit: 10 });

    expect(output.total).toBe(42);
    expect(output.page).toBe(3);
    expect(output.limit).toBe(10);
  });

  it('should throw if repository throws', async () => {
    repo.list.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({})).rejects.toThrow('Database error');
  });
});
