import { ITEM_UUID_1 } from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStock } from '../../../helpers/stock.factory';

import { AdjustStockUseCase } from './adjust-stock.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

const makeInput = (overrides = {}) => ({
  itemId: ITEM_UUID_1,
  newQuantity: 80,
  note: 'Inventário mensal',
  ...overrides,
});

describe('AdjustStockUseCase', () => {
  let sut: AdjustStockUseCase;
  let repo: StockRepositoryMock;

  beforeEach(() => {
    repo = makeStockRepositoryMock();
    sut = new AdjustStockUseCase(repo);
  });

  it('should adjust stock quantity to the new value', async () => {
    const stock = makeStock({ quantity: 100, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ newQuantity: 80 }));

    expect(stock.quantity).toBe(80);
  });

  it('should save movement with ADJUSTMENT reason and correct diff', async () => {
    const stock = makeStock({ quantity: 100, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ newQuantity: 80 }));

    const [movement] = repo.saveMovement.mock.calls[0];
    expect(movement.reason).toBe('ADJUSTMENT');
    expect(movement.quantity).toBe(-20); // 80 - 100 = -20
  });

  it('should save movement with positive diff when increasing', async () => {
    const stock = makeStock({ quantity: 50, reserved: 0 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ newQuantity: 70 }));

    const [movement] = repo.saveMovement.mock.calls[0];
    expect(movement.quantity).toBe(20); // 70 - 50 = +20
  });

  it('should allow adjusting to zero when reserved is also zero', async () => {
    const stock = makeStock({ quantity: 50, reserved: 0 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ newQuantity: 0 }));

    expect(stock.quantity).toBe(0);
  });

  it('should throw BusinessRuleException when newQuantity is below reserved', async () => {
    const stock = makeStock({ quantity: 100, reserved: 20 });
    repo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ newQuantity: 15 }))).rejects.toThrow(
      BusinessRuleException,
    );
    await expect(sut.execute(makeInput({ newQuantity: 15 }))).rejects.toThrow(
      'Cannot adjust below reserved quantity',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException when newQuantity is negative', async () => {
    const stock = makeStock({ quantity: 100, reserved: 0 });
    repo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ newQuantity: -1 }))).rejects.toThrow(
      BusinessRuleException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should allow adjusting to exactly the reserved amount', async () => {
    const stock = makeStock({ quantity: 100, reserved: 20 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ newQuantity: 20 }));

    expect(stock.quantity).toBe(20);
    expect(stock.available).toBe(0);
  });

  it('should throw NotFoundException if stock does not exist', async () => {
    repo.findByItemId.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not save movement when update throws', async () => {
    const stock = makeStock({ quantity: 100, reserved: 0 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.saveMovement).not.toHaveBeenCalled();
  });
});
