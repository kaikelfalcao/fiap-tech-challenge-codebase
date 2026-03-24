import {
  makeServiceRepositoryMock,
  type ServiceRepositoryMock,
} from '../../helpers/service-repository.mock';
import { makeService, SERVICE_UUID_1 } from '../../helpers/service.factory';

import { DeactivateServiceUseCase } from './deactivate-service.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('DeactivateServiceUseCase', () => {
  let sut: DeactivateServiceUseCase;
  let repo: ServiceRepositoryMock;

  beforeEach(() => {
    repo = makeServiceRepositoryMock();
    sut = new DeactivateServiceUseCase(repo);
  });

  it('should deactivate an active service', async () => {
    const service = makeService({ active: true });
    repo.findById.mockResolvedValue(service);
    repo.update.mockResolvedValue();

    await sut.execute({ id: SERVICE_UUID_1 });

    expect(service.active).toBe(false);
  });

  it('should call update with the deactivated service', async () => {
    const service = makeService({ active: true });
    repo.findById.mockResolvedValue(service);
    repo.update.mockResolvedValue();

    await sut.execute({ id: SERVICE_UUID_1 });

    expect(repo.update).toHaveBeenCalledWith(service);
  });

  it('should still call update even if already inactive', async () => {
    const service = makeService({ active: false });
    repo.findById.mockResolvedValue(service);
    repo.update.mockResolvedValue();

    await sut.execute({ id: SERVICE_UUID_1 });

    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException if service does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: SERVICE_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not call update when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ id: SERVICE_UUID_1 })).rejects.toThrow(
      'Database error',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});
