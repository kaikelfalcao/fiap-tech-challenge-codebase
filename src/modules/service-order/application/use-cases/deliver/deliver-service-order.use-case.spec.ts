import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrderWithStatus,
  SO_UUID_1,
} from '../../helpers/service-order.factory';

import { DeliverServiceOrderUseCase } from './deliver-service-order.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('DeliverServiceOrderUseCase', () => {
  let sut: DeliverServiceOrderUseCase;
  let repo: SORepositoryMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    sut = new DeliverServiceOrderUseCase(repo);
  });

  it('should transition order from FINALIZED to DELIVERED', async () => {
    const order = makeServiceOrderWithStatus('FINALIZED');
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.status).toBe('DELIVERED');
  });

  it('should set deliveredAt timestamp', async () => {
    const order = makeServiceOrderWithStatus('FINALIZED');
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    const before = new Date();
    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.deliveredAt).not.toBeNull();
    expect(order.deliveredAt!.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });

  it('should call update with the delivered order', async () => {
    const order = makeServiceOrderWithStatus('FINALIZED');
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(repo.update).toHaveBeenCalledWith(order);
  });

  it('should throw BusinessRuleException if order is not FINALIZED', async () => {
    repo.findById.mockResolvedValue(makeServiceOrderWithStatus('IN_EXECUTION'));

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      BusinessRuleException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if order does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not call update when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      'Database error',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});
