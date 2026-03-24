import {
  makeServiceRepositoryMock,
  type ServiceRepositoryMock,
} from '../../helpers/service-repository.mock';
import { makeService, SERVICE_UUID_1 } from '../../helpers/service.factory';

import { UpdateServiceUseCase } from './update-service.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  id: SERVICE_UUID_1,
  name: 'Alinhamento e balanceamento',
  description: 'Alinhamento das 4 rodas e balanceamento',
  basePriceCents: 15000,
  estimatedDurationMinutes: 60,
  ...overrides,
});

describe('UpdateServiceUseCase', () => {
  let sut: UpdateServiceUseCase;
  let repo: ServiceRepositoryMock;

  beforeEach(() => {
    repo = makeServiceRepositoryMock();
    sut = new UpdateServiceUseCase(repo);
  });

  it('should update all provided attributes', async () => {
    const service = makeService();
    repo.findById.mockResolvedValue(service);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(service.name).toBe('Alinhamento e balanceamento');
    expect(service.description).toBe('Alinhamento das 4 rodas e balanceamento');
    expect(service.basePrice.cents).toBe(15000);
    expect(service.estimatedDuration.minutes).toBe(60);
  });

  it('should call update with the modified service', async () => {
    const service = makeService();
    repo.findById.mockResolvedValue(service);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(service);
  });

  it('should update only provided fields', async () => {
    const service = makeService();
    const originalDescription = service.description;
    const originalPrice = service.basePrice.cents;
    const originalDuration = service.estimatedDuration.minutes;
    repo.findById.mockResolvedValue(service);
    repo.update.mockResolvedValue();

    await sut.execute({ id: SERVICE_UUID_1, name: 'Only Name Changed' });

    expect(service.name).toBe('Only Name Changed');
    expect(service.description).toBe(originalDescription);
    expect(service.basePrice.cents).toBe(originalPrice);
    expect(service.estimatedDuration.minutes).toBe(originalDuration);
  });

  it('should throw NotFoundException if service does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if basePriceCents is negative', async () => {
    const service = makeService();
    repo.findById.mockResolvedValue(service);

    await expect(
      sut.execute(makeInput({ basePriceCents: -1 })),
    ).rejects.toThrow(ValidationException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if duration is zero', async () => {
    const service = makeService();
    repo.findById.mockResolvedValue(service);

    await expect(
      sut.execute(makeInput({ estimatedDurationMinutes: 0 })),
    ).rejects.toThrow(ValidationException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should call findById with the correct ServiceId', async () => {
    const service = makeService();
    repo.findById.mockResolvedValue(service);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(SERVICE_UUID_1);
  });

  it('should not call update when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.update).not.toHaveBeenCalled();
  });
});
