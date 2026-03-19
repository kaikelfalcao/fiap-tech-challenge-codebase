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

import { FinalizeServiceOrderUseCase } from './finalize-service-order.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('FinalizeServiceOrderUseCase', () => {
  let sut: FinalizeServiceOrderUseCase;
  let repo: SORepositoryMock;
  let inventoryApi: InventoryApiMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    inventoryApi = makeInventoryApiMock();
    sut = new FinalizeServiceOrderUseCase(repo, inventoryApi);
  });

  it('should transition order from IN_EXECUTION to FINALIZED', async () => {
    const order = makeServiceOrderWithStatus('IN_EXECUTION');
    repo.findById.mockResolvedValue(order);
    inventoryApi.consumeStock.mockResolvedValue();
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.status).toBe('FINALIZED');
  });

  it('should set finalizedAt timestamp', async () => {
    const order = makeServiceOrderWithStatus('IN_EXECUTION');
    repo.findById.mockResolvedValue(order);
    inventoryApi.consumeStock.mockResolvedValue();
    repo.update.mockResolvedValue();

    const before = new Date();
    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.finalizedAt).not.toBeNull();
    expect(order.finalizedAt!.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });

  it('should consume stock for each item in the order', async () => {
    const order = makeServiceOrderWithStatus('IN_EXECUTION', {
      items: [
        makeSOItem({ itemId: ITEM_UUID_1, quantity: 2 }),
        makeSOItem({ itemId: ITEM_UUID_2, quantity: 1 }),
      ],
    });
    repo.findById.mockResolvedValue(order);
    inventoryApi.consumeStock.mockResolvedValue();
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(inventoryApi.consumeStock).toHaveBeenCalledTimes(2);
    expect(inventoryApi.consumeStock).toHaveBeenCalledWith(
      ITEM_UUID_1,
      2,
      order.id().value,
    );
    expect(inventoryApi.consumeStock).toHaveBeenCalledWith(
      ITEM_UUID_2,
      1,
      order.id().value,
    );
  });

  it('should not call consumeStock when order has no items', async () => {
    const order = makeServiceOrderWithStatus('IN_EXECUTION', { items: [] });
    repo.findById.mockResolvedValue(order);
    inventoryApi.consumeStock.mockResolvedValue();
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(inventoryApi.consumeStock).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException if order is not IN_EXECUTION', async () => {
    repo.findById.mockResolvedValue(
      makeServiceOrderWithStatus('AWAITING_APPROVAL'),
    );

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      BusinessRuleException,
    );
    expect(inventoryApi.consumeStock).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if order does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not call update when consumeStock throws', async () => {
    const order = makeServiceOrderWithStatus('IN_EXECUTION', {
      items: [makeSOItem()],
    });
    repo.findById.mockResolvedValue(order);
    inventoryApi.consumeStock.mockRejectedValue(new Error('Stock error'));

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      'Stock error',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});
