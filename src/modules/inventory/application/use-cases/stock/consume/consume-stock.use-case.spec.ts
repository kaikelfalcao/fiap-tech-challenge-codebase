import { ITEM_UUID_1 } from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStock, SERVICE_ORDER_REF } from '../../../helpers/stock.factory';

import { ConsumeStockUseCase } from './consume-stock.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

const makeInput = (overrides = {}) => ({
  itemId: ITEM_UUID_1,
  amount: 5,
  referenceId: SERVICE_ORDER_REF,
  note: 'Consumo OS-001',
  ...overrides,
});

describe('ConsumeStockUseCase', () => {
  let sut: ConsumeStockUseCase;
  let repo: StockRepositoryMock;

  beforeEach(() => {
    repo = makeStockRepositoryMock();
    sut = new ConsumeStockUseCase(repo);
  });

  it('should consume reserved stock and decrease both quantity and reserved', async () => {
    const stock = makeStock({ quantity: 100, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 5 }));

    expect(stock.quantity).toBe(95);
    expect(stock.reserved).toBe(5);
    expect(stock.available).toBe(90);
  });

  it('should save movement with CONSUMPTION reason and negative quantity', async () => {
    const stock = makeStock({ quantity: 100, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 5 }));

    const [movement] = repo.saveMovement.mock.calls[0];
    expect(movement.reason).toBe('CONSUMPTION');
    expect(movement.quantity).toBe(-5);
    expect(movement.referenceId).toBe(SERVICE_ORDER_REF);
  });

  it('should allow consuming exactly the reserved amount', async () => {
    const stock = makeStock({ quantity: 50, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 10 }));

    expect(stock.quantity).toBe(40);
    expect(stock.reserved).toBe(0);
  });

  it('should throw BusinessRuleException when consuming more than reserved', async () => {
    const stock = makeStock({ quantity: 100, reserved: 3 });
    repo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ amount: 5 }))).rejects.toThrow(
      BusinessRuleException,
    );
    await expect(sut.execute(makeInput({ amount: 5 }))).rejects.toThrow(
      'Cannot consume more than reserved',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException when amount is zero', async () => {
    const stock = makeStock({ quantity: 100, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ amount: 0 }))).rejects.toThrow(
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
    const stock = makeStock({ quantity: 100, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.saveMovement).not.toHaveBeenCalled();
  });
});
