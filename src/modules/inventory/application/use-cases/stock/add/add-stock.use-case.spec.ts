import { mock, type MockProxy } from 'jest-mock-extended';

import type { ItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { makeItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { ITEM_UUID_1, makeItem } from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStock } from '../../../helpers/stock.factory';

import { AddStockUseCase } from './add-stock.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import type { MetricsService } from '@/shared/infrastructure/metrics/metrics.service';

const makeInput = (overrides = {}) => ({
  itemId: ITEM_UUID_1,
  amount: 20,
  reason: 'PURCHASE' as const,
  note: 'Compra NF-001',
  ...overrides,
});

describe('AddStockUseCase', () => {
  let sut: AddStockUseCase;
  let stockRepo: StockRepositoryMock;
  let itemRepo: ItemRepositoryMock;
  let metrics: MockProxy<MetricsService>;

  beforeEach(() => {
    stockRepo = makeStockRepositoryMock();
    itemRepo = makeItemRepositoryMock();
    metrics = mock<MetricsService>();
    sut = new AddStockUseCase(stockRepo, itemRepo, metrics);
  });

  it('should add quantity to stock', async () => {
    const stock = makeStock({ quantity: 100 });
    stockRepo.findByItemId.mockResolvedValue(stock);
    stockRepo.update.mockResolvedValue();
    stockRepo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 20 }));

    expect(stock.quantity).toBe(120);
  });

  it('should save movement after updating stock', async () => {
    const stock = makeStock({ quantity: 100 });
    stockRepo.findByItemId.mockResolvedValue(stock);
    stockRepo.update.mockResolvedValue();
    stockRepo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput());

    expect(stockRepo.update).toHaveBeenCalledTimes(1);
    expect(stockRepo.saveMovement).toHaveBeenCalledTimes(1);
  });

  it('should save movement with correct reason and quantity', async () => {
    const stock = makeStock({ quantity: 0 });
    stockRepo.findByItemId.mockResolvedValue(stock);
    stockRepo.update.mockResolvedValue();
    stockRepo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 50, reason: 'PURCHASE' }));

    const [movement] = stockRepo.saveMovement.mock.calls[0];
    expect(movement.quantity).toBe(50);
    expect(movement.reason).toBe('PURCHASE');
  });

  it('should work with ADJUSTMENT reason', async () => {
    const stock = makeStock({ quantity: 100 });
    stockRepo.findByItemId.mockResolvedValue(stock);
    stockRepo.update.mockResolvedValue();
    stockRepo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ reason: 'ADJUSTMENT', amount: 5 }));

    const [movement] = stockRepo.saveMovement.mock.calls[0];
    expect(movement.reason).toBe('ADJUSTMENT');
  });

  it('should record metric when stock is below minimum after add', async () => {
    // minimum = 5, quantity = 0, after add = 3, available = 3 <= 5
    const stock = makeStock({ quantity: 0, reserved: 0, minimum: 5 });
    const item = makeItem();
    stockRepo.findByItemId.mockResolvedValue(stock);
    stockRepo.update.mockResolvedValue();
    stockRepo.saveMovement.mockResolvedValue();
    itemRepo.findById.mockResolvedValue(item);

    await sut.execute(makeInput({ amount: 3 }));

    expect(metrics.recordStockBelowMinimum).toHaveBeenCalledWith(
      ITEM_UUID_1,
      item.code.value,
      3, // available após add
    );
  });

  it('should not record metric when stock is above minimum', async () => {
    const stock = makeStock({ quantity: 0, reserved: 0, minimum: 5 });
    stockRepo.findByItemId.mockResolvedValue(stock);
    stockRepo.update.mockResolvedValue();
    stockRepo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 50 }));

    expect(metrics.recordStockBelowMinimum).not.toHaveBeenCalled();
    expect(itemRepo.findById).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException when amount is zero', async () => {
    const stock = makeStock();
    stockRepo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ amount: 0 }))).rejects.toThrow(
      BusinessRuleException,
    );
    expect(stockRepo.update).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException when amount is negative', async () => {
    const stock = makeStock();
    stockRepo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ amount: -5 }))).rejects.toThrow(
      BusinessRuleException,
    );
    expect(stockRepo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if stock does not exist', async () => {
    stockRepo.findByItemId.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(stockRepo.update).not.toHaveBeenCalled();
  });

  it('should not save movement when update throws', async () => {
    const stock = makeStock();
    stockRepo.findByItemId.mockResolvedValue(stock);
    stockRepo.update.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(stockRepo.saveMovement).not.toHaveBeenCalled();
  });
});
