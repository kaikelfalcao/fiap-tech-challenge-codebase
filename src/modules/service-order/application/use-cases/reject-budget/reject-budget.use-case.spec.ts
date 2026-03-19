import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrderWithStatus,
  SO_UUID_1,
} from '../../helpers/service-order.factory';

import { RejectBudgetUseCase } from './reject-budget.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('RejectBudgetUseCase', () => {
  let sut: RejectBudgetUseCase;
  let repo: SORepositoryMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    sut = new RejectBudgetUseCase(repo);
  });

  it('should transition order from AWAITING_APPROVAL to FINALIZED', async () => {
    const order = makeServiceOrderWithStatus('AWAITING_APPROVAL');
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.status).toBe('FINALIZED');
  });

  it('should set both rejectedAt and finalizedAt timestamps', async () => {
    const order = makeServiceOrderWithStatus('AWAITING_APPROVAL');
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    const before = new Date();
    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.rejectedAt).not.toBeNull();
    expect(order.finalizedAt).not.toBeNull();
    expect(order.rejectedAt!.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });

  it('should not reserve stock when rejecting', async () => {
    const order = makeServiceOrderWithStatus('AWAITING_APPROVAL');
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    // No inventory interaction expected
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should throw BusinessRuleException if order is not AWAITING_APPROVAL', async () => {
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
});
