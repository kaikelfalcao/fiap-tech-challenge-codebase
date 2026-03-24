import { ITEM_UUID_1 } from '../../../helpers/item.factory';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';
import {
  makeMovement,
  makeStock,
  makeStockMovementId,
  SERVICE_ORDER_REF,
  STOCK_UUID_1,
} from '../../../helpers/stock.factory';

import { GetStockMovementsUseCase } from './get-stock-movements.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('GetStockMovementsUseCase', () => {
  let sut: GetStockMovementsUseCase;
  let repo: StockRepositoryMock;

  beforeEach(() => {
    repo = makeStockRepositoryMock();
    sut = new GetStockMovementsUseCase(repo);
  });

  it('should return list of movements for the item', async () => {
    const stock = makeStock();
    const movements = [
      makeMovement({ reason: 'PURCHASE', quantity: 50 }),
      makeMovement({
        id: makeStockMovementId('e1f2a3b4-0002-4000-8000-000000000002'),
        reason: 'RESERVATION',
        quantity: -10,
        referenceId: SERVICE_ORDER_REF,
      }),
    ];
    repo.findByItemId.mockResolvedValue(stock);
    repo.listMovements.mockResolvedValue(movements);

    const output = await sut.execute({ itemId: ITEM_UUID_1 });

    expect(output).toHaveLength(2);
  });

  it('should map each movement to the output shape', async () => {
    const stock = makeStock();
    const movement = makeMovement({
      quantity: 50,
      reason: 'PURCHASE',
      referenceId: undefined,
      note: 'Compra inicial',
    });
    repo.findByItemId.mockResolvedValue(stock);
    repo.listMovements.mockResolvedValue([movement]);

    const output = await sut.execute({ itemId: ITEM_UUID_1 });
    const item = output[0];

    expect(item.id).toBe(movement.id().value);
    expect(item.quantity).toBe(50);
    expect(item.reason).toBe('PURCHASE');
    expect(item.note).toBe('Compra inicial');
    expect(item.createdAt).toBe(movement.createdAt);
  });

  it('should include referenceId when present', async () => {
    const stock = makeStock();
    const movement = makeMovement({
      reason: 'RESERVATION',
      quantity: -5,
      referenceId: SERVICE_ORDER_REF,
    });
    repo.findByItemId.mockResolvedValue(stock);
    repo.listMovements.mockResolvedValue([movement]);

    const output = await sut.execute({ itemId: ITEM_UUID_1 });

    expect(output[0].referenceId).toBe(SERVICE_ORDER_REF);
  });

  it('should call listMovements with the correct stockId', async () => {
    const stock = makeStock();
    repo.findByItemId.mockResolvedValue(stock);
    repo.listMovements.mockResolvedValue([]);

    await sut.execute({ itemId: ITEM_UUID_1 });

    expect(repo.listMovements).toHaveBeenCalledWith(STOCK_UUID_1);
  });

  it('should return empty list when no movements exist', async () => {
    const stock = makeStock();
    repo.findByItemId.mockResolvedValue(stock);
    repo.listMovements.mockResolvedValue([]);

    const output = await sut.execute({ itemId: ITEM_UUID_1 });

    expect(output).toHaveLength(0);
  });

  it('should throw NotFoundException if stock does not exist', async () => {
    repo.findByItemId.mockResolvedValue(null);

    await expect(sut.execute({ itemId: ITEM_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.listMovements).not.toHaveBeenCalled();
  });

  it('should throw if listMovements throws', async () => {
    const stock = makeStock();
    repo.findByItemId.mockResolvedValue(stock);
    repo.listMovements.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ itemId: ITEM_UUID_1 })).rejects.toThrow(
      'Database error',
    );
  });
});
