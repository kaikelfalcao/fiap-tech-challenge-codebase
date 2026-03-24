import { ITEM_UUID_1 } from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStock, SERVICE_ORDER_REF } from '../../../helpers/stock.factory';

import { ReserveStockUseCase } from './reserve-stock.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

const makeInput = (overrides = {}) => ({
  itemId: ITEM_UUID_1,
  amount: 5,
  referenceId: SERVICE_ORDER_REF,
  note: 'OS-001',
  ...overrides,
});

describe('ReserveStockUseCase', () => {
  let sut: ReserveStockUseCase;
  let repo: StockRepositoryMock;

  beforeEach(() => {
    repo = makeStockRepositoryMock();
    sut = new ReserveStockUseCase(repo);
  });

  it('should reserve stock and increase reserved field', async () => {
    const stock = makeStock({ quantity: 100, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 5 }));

    expect(stock.reserved).toBe(15);
    expect(stock.available).toBe(85);
  });

  it('should save movement with RESERVATION reason and negative quantity', async () => {
    const stock = makeStock({ quantity: 100, reserved: 0 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 10 }));

    const [movement] = repo.saveMovement.mock.calls[0];
    expect(movement.reason).toBe('RESERVATION');
    expect(movement.quantity).toBe(-10);
    expect(movement.referenceId).toBe(SERVICE_ORDER_REF);
  });

  it('should throw BusinessRuleException when available is insufficient', async () => {
    const stock = makeStock({ quantity: 10, reserved: 8 }); // available = 2
    repo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ amount: 5 }))).rejects.toThrow(
      BusinessRuleException,
    );
    await expect(sut.execute(makeInput({ amount: 5 }))).rejects.toThrow(
      'Insufficient stock',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should allow reserving exactly the available amount', async () => {
    const stock = makeStock({ quantity: 10, reserved: 5 }); // available = 5
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 5 }));

    expect(stock.reserved).toBe(10);
    expect(stock.available).toBe(0);
  });

  it('should throw BusinessRuleException when amount is zero', async () => {
    const stock = makeStock();
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
});
