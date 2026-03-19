import { ITEM_UUID_1 } from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStock } from '../../../helpers/stock.factory';

import { AddStockUseCase } from './add-stock.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

const makeInput = (overrides = {}) => ({
  itemId: ITEM_UUID_1,
  amount: 20,
  reason: 'PURCHASE' as const,
  note: 'Compra NF-001',
  ...overrides,
});

describe('AddStockUseCase', () => {
  let sut: AddStockUseCase;
  let repo: StockRepositoryMock;

  beforeEach(() => {
    repo = makeStockRepositoryMock();
    sut = new AddStockUseCase(repo);
  });

  it('should add quantity to stock', async () => {
    const stock = makeStock({ quantity: 100 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 20 }));

    expect(stock.quantity).toBe(120);
  });

  it('should save movement after updating stock', async () => {
    const stock = makeStock({ quantity: 100 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput());

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.saveMovement).toHaveBeenCalledTimes(1);
  });

  it('should save movement with correct reason and quantity', async () => {
    const stock = makeStock({ quantity: 0 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 50, reason: 'PURCHASE' }));

    const [movement] = repo.saveMovement.mock.calls[0];
    expect(movement.quantity).toBe(50);
    expect(movement.reason).toBe('PURCHASE');
  });

  it('should work with ADJUSTMENT reason', async () => {
    const stock = makeStock({ quantity: 100 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ reason: 'ADJUSTMENT', amount: 5 }));

    const [movement] = repo.saveMovement.mock.calls[0];
    expect(movement.reason).toBe('ADJUSTMENT');
  });

  it('should throw BusinessRuleException when amount is zero', async () => {
    const stock = makeStock();
    repo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ amount: 0 }))).rejects.toThrow(
      BusinessRuleException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException when amount is negative', async () => {
    const stock = makeStock();
    repo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ amount: -5 }))).rejects.toThrow(
      BusinessRuleException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if stock does not exist', async () => {
    repo.findByItemId.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not save movement when update throws', async () => {
    const stock = makeStock();
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.saveMovement).not.toHaveBeenCalled();
  });
});
