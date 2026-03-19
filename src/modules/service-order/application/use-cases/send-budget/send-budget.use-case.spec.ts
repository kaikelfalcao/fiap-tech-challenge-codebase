import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  makeServiceOrderWithStatus,
  makeSOService,
  SO_UUID_1,
} from '../../helpers/service-order.factory';

import { SendBudgetUseCase } from './send-budget.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('SendBudgetUseCase', () => {
  let sut: SendBudgetUseCase;
  let repo: SORepositoryMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    sut = new SendBudgetUseCase(repo);
  });

  it('should transition order from DIAGNOSIS to AWAITING_APPROVAL', async () => {
    const order = makeServiceOrder({
      status: 'DIAGNOSIS',
      services: [makeSOService()],
    });
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.status).toBe('AWAITING_APPROVAL');
  });

  it('should set budgetSentAt timestamp', async () => {
    const order = makeServiceOrder({
      status: 'DIAGNOSIS',
      services: [makeSOService()],
    });
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    const before = new Date();
    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.budgetSentAt).not.toBeNull();
    expect(order.budgetSentAt!.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });

  it('should throw BusinessRuleException if order has no services', async () => {
    const order = makeServiceOrder({ status: 'DIAGNOSIS', services: [] });
    repo.findById.mockResolvedValue(order);

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      BusinessRuleException,
    );
    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      'no services',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException if order is not DIAGNOSIS', async () => {
    repo.findById.mockResolvedValue(makeServiceOrderWithStatus('RECEIVED'));

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
});
