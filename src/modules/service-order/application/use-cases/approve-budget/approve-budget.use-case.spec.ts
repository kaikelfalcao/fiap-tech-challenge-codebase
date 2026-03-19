import {
  makeInventoryApiMock,
  type InventoryApiMock,
} from '../../helpers/external-apis.mock';
import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrderWithStatus,
  makeSOItem,
  SO_UUID_1,
  ITEM_UUID_1,
  ITEM_UUID_2,
} from '../../helpers/service-order.factory';

import { ApproveBudgetUseCase } from './approve-budget.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('ApproveBudgetUseCase', () => {
  let sut: ApproveBudgetUseCase;
  let repo: SORepositoryMock;
  let inventoryApi: InventoryApiMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    inventoryApi = makeInventoryApiMock();
    sut = new ApproveBudgetUseCase(repo, inventoryApi);
  });

  it('should transition order from AWAITING_APPROVAL to IN_EXECUTION', async () => {
    const order = makeServiceOrderWithStatus('AWAITING_APPROVAL');
    repo.findById.mockResolvedValue(order);
    inventoryApi.reserveStock.mockResolvedValue();
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.status).toBe('IN_EXECUTION');
  });

  it('should set approvedAt timestamp', async () => {
    const order = makeServiceOrderWithStatus('AWAITING_APPROVAL');
    repo.findById.mockResolvedValue(order);
    inventoryApi.reserveStock.mockResolvedValue();
    repo.update.mockResolvedValue();

    const before = new Date();
    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.approvedAt).not.toBeNull();
    expect(order.approvedAt!.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });

  it('should reserve stock for each item in the order', async () => {
    const order = makeServiceOrderWithStatus('AWAITING_APPROVAL', {
      items: [
        makeSOItem({ itemId: ITEM_UUID_1, quantity: 2 }),
        makeSOItem({ itemId: ITEM_UUID_2, quantity: 3 }),
      ],
    });
    repo.findById.mockResolvedValue(order);
    inventoryApi.reserveStock.mockResolvedValue();
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(inventoryApi.reserveStock).toHaveBeenCalledTimes(2);
    expect(inventoryApi.reserveStock).toHaveBeenCalledWith(
      ITEM_UUID_1,
      2,
      order.id().value,
    );
    expect(inventoryApi.reserveStock).toHaveBeenCalledWith(
      ITEM_UUID_2,
      3,
      order.id().value,
    );
  });

  it('should not call reserveStock when order has no items', async () => {
    const order = makeServiceOrderWithStatus('AWAITING_APPROVAL', {
      items: [],
    });
    repo.findById.mockResolvedValue(order);
    inventoryApi.reserveStock.mockResolvedValue();
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(inventoryApi.reserveStock).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException if order is not AWAITING_APPROVAL', async () => {
    repo.findById.mockResolvedValue(makeServiceOrderWithStatus('RECEIVED'));

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      BusinessRuleException,
    );
    expect(inventoryApi.reserveStock).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if order does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not call update when reserveStock throws', async () => {
    const order = makeServiceOrderWithStatus('AWAITING_APPROVAL', {
      items: [makeSOItem()],
    });
    repo.findById.mockResolvedValue(order);
    inventoryApi.reserveStock.mockRejectedValue(new Error('Stock error'));

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      'Stock error',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});
