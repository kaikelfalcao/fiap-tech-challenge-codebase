import { ITEM_UUID_1 } from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStock, SERVICE_ORDER_REF } from '../../../helpers/stock.factory';

import { ReleaseStockUseCase } from './release-stock.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

const makeInput = (overrides = {}) => ({
  itemId: ITEM_UUID_1,
  amount: 5,
  referenceId: SERVICE_ORDER_REF,
  note: 'OS cancelada',
  ...overrides,
});

describe('ReleaseStockUseCase', () => {
  let sut: ReleaseStockUseCase;
  let repo: StockRepositoryMock;

  beforeEach(() => {
    repo = makeStockRepositoryMock();
    sut = new ReleaseStockUseCase(repo);
  });

  it('should release reserved stock', async () => {
    const stock = makeStock({ quantity: 100, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 5 }));

    expect(stock.reserved).toBe(5);
    expect(stock.available).toBe(95);
  });

  it('should save movement with RELEASE reason and positive quantity', async () => {
    const stock = makeStock({ quantity: 100, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 5 }));

    const [movement] = repo.saveMovement.mock.calls[0];
    expect(movement.reason).toBe('RELEASE');
    expect(movement.quantity).toBe(5);
    expect(movement.referenceId).toBe(SERVICE_ORDER_REF);
  });

  it('should allow releasing exactly the reserved amount', async () => {
    const stock = makeStock({ quantity: 50, reserved: 10 });
    repo.findByItemId.mockResolvedValue(stock);
    repo.update.mockResolvedValue();
    repo.saveMovement.mockResolvedValue();

    await sut.execute(makeInput({ amount: 10 }));

    expect(stock.reserved).toBe(0);
    expect(stock.available).toBe(50);
  });

  it('should throw BusinessRuleException when releasing more than reserved', async () => {
    const stock = makeStock({ quantity: 100, reserved: 3 });
    repo.findByItemId.mockResolvedValue(stock);

    await expect(sut.execute(makeInput({ amount: 5 }))).rejects.toThrow(
      BusinessRuleException,
    );
    await expect(sut.execute(makeInput({ amount: 5 }))).rejects.toThrow(
      'Cannot release more than reserved',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if stock does not exist', async () => {
    repo.findByItemId.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
