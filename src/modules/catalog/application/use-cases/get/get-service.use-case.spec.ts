import { Duration } from '../../../domain/value-objects/duration.vo';
import {
  makeServiceRepositoryMock,
  type ServiceRepositoryMock,
} from '../../helpers/service-repository.mock';
import { makeService, SERVICE_UUID_1 } from '../../helpers/service.factory';

import { GetServiceUseCase } from './get-service.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { Money } from '@/shared/domain/value-objects/money.vo';

describe('GetServiceUseCase', () => {
  let sut: GetServiceUseCase;
  let repo: ServiceRepositoryMock;

  beforeEach(() => {
    repo = makeServiceRepositoryMock();
    sut = new GetServiceUseCase(repo);
  });

  it('should return the service output', async () => {
    const service = makeService();
    repo.findById.mockResolvedValue(service);

    const output = await sut.execute({ id: SERVICE_UUID_1 });

    expect(output.id).toBe(service.id().value);
    expect(output.code).toBe(service.code.value);
    expect(output.name).toBe(service.name);
    expect(output.description).toBe(service.description);
    expect(output.basePriceCents).toBe(service.basePrice.cents);
    expect(output.estimatedDurationMinutes).toBe(
      service.estimatedDuration.minutes,
    );
    expect(output.active).toBe(service.active);
    expect(output.createdAt).toBe(service.createdAt);
    expect(output.updatedAt).toBe(service.updatedAt);
  });

  it('should return formatted base price', async () => {
    const service = makeService({ basePrice: Money.fromCents(8000) });
    repo.findById.mockResolvedValue(service);

    const output = await sut.execute({ id: SERVICE_UUID_1 });

    expect(output.basePriceFormatted).toContain('R$');
    expect(output.basePriceFormatted).toContain('80');
  });

  it('should return formatted duration in minutes only', async () => {
    const service = makeService({ estimatedDuration: Duration.create(30) });
    repo.findById.mockResolvedValue(service);

    const output = await sut.execute({ id: SERVICE_UUID_1 });

    expect(output.estimatedDurationFormatted).toBe('30min');
  });

  it('should return formatted duration in hours and minutes', async () => {
    const service = makeService({ estimatedDuration: Duration.create(90) });
    repo.findById.mockResolvedValue(service);

    const output = await sut.execute({ id: SERVICE_UUID_1 });

    expect(output.estimatedDurationFormatted).toBe('1h 30min');
  });

  it('should return formatted duration in full hours', async () => {
    const service = makeService({ estimatedDuration: Duration.create(120) });
    repo.findById.mockResolvedValue(service);

    const output = await sut.execute({ id: SERVICE_UUID_1 });

    expect(output.estimatedDurationFormatted).toBe('2h');
  });

  it('should call findById with the correct ServiceId', async () => {
    const service = makeService();
    repo.findById.mockResolvedValue(service);

    await sut.execute({ id: SERVICE_UUID_1 });

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(SERVICE_UUID_1);
  });

  it('should throw NotFoundException if service does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: SERVICE_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
  });
});
