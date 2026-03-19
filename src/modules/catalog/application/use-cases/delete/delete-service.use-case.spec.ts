import {
  makeServiceRepositoryMock,
  type ServiceRepositoryMock,
} from '../../helpers/service-repository.mock';
import { makeService, SERVICE_UUID_1 } from '../../helpers/service.factory';

import { DeleteServiceUseCase } from './delete-service.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('DeleteServiceUseCase', () => {
  let sut: DeleteServiceUseCase;
  let repo: ServiceRepositoryMock;

  beforeEach(() => {
    repo = makeServiceRepositoryMock();
    sut = new DeleteServiceUseCase(repo);
  });

  it('should delete an inactive service', async () => {
    const service = makeService({ active: false });
    repo.findById.mockResolvedValue(service);
    repo.delete.mockResolvedValue();

    await sut.execute({ id: SERVICE_UUID_1 });

    expect(repo.delete).toHaveBeenCalledTimes(1);
  });

  it('should call delete with the correct ServiceId', async () => {
    const service = makeService({ active: false });
    repo.findById.mockResolvedValue(service);
    repo.delete.mockResolvedValue();

    await sut.execute({ id: SERVICE_UUID_1 });

    const [calledId] = repo.delete.mock.calls[0];
    expect(calledId.value).toBe(SERVICE_UUID_1);
  });

  it('should call ensureCanBeDeleted before deleting', async () => {
    const service = makeService({ active: false });
    const spy = jest.spyOn(service, 'ensureCanBeDeleted');
    repo.findById.mockResolvedValue(service);
    repo.delete.mockResolvedValue();

    await sut.execute({ id: SERVICE_UUID_1 });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should throw BusinessRuleException when service is active', async () => {
    const service = makeService({ active: true });
    repo.findById.mockResolvedValue(service);

    await expect(sut.execute({ id: SERVICE_UUID_1 })).rejects.toThrow(
      BusinessRuleException,
    );
    await expect(sut.execute({ id: SERVICE_UUID_1 })).rejects.toThrow(
      'Cannot delete an active service. Deactivate it first.',
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if service does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: SERVICE_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should not call delete when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ id: SERVICE_UUID_1 })).rejects.toThrow(
      'Database error',
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
