import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  makeSOService,
  makeServiceOrderWithStatus,
  SO_UUID_1,
  SERVICE_UUID_1,
} from '../../helpers/service-order.factory';

import { RemoveServiceFromOrderUseCase } from './remove-service-from-order.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

describe('RemoveServiceFromOrderUseCase', () => {
  let sut: RemoveServiceFromOrderUseCase;
  let repo: SORepositoryMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    sut = new RemoveServiceFromOrderUseCase(repo);
  });

  it('should remove a service from the order', async () => {
    const order = makeServiceOrder({ services: [makeSOService()] });
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1, serviceId: SERVICE_UUID_1 });

    expect(order.services).toHaveLength(0);
  });

  it('should call update with the modified order', async () => {
    const order = makeServiceOrder({ services: [makeSOService()] });
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1, serviceId: SERVICE_UUID_1 });

    expect(repo.update).toHaveBeenCalledWith(order);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      sut.execute({ orderId: SO_UUID_1, serviceId: SERVICE_UUID_1 }),
    ).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if service not in order', async () => {
    repo.findById.mockResolvedValue(makeServiceOrder({ services: [] }));

    await expect(
      sut.execute({ orderId: SO_UUID_1, serviceId: SERVICE_UUID_1 }),
    ).rejects.toThrow(ValidationException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if order is not editable', async () => {
    const order = makeServiceOrderWithStatus('IN_EXECUTION', {
      services: [makeSOService()],
    });
    repo.findById.mockResolvedValue(order);

    await expect(
      sut.execute({ orderId: SO_UUID_1, serviceId: SERVICE_UUID_1 }),
    ).rejects.toThrow(ValidationException);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
