import { StockMovement } from '../../domain/stock-movement.entity';
import type { StockMovementProps } from '../../domain/stock-movement.entity';
import { Stock } from '../../domain/stock.entity';
import type { StockProps } from '../../domain/stock.entity';
import { StockId } from '../../domain/value-objects/stock-id.vo';
import { StockMovementId } from '../../domain/value-objects/stock-movement-id.vo';

import { ITEM_UUID_1 } from './item.factory';

export const STOCK_UUID_1 = 'd1e2f3a4-0001-4000-8000-000000000001';
export const MOVEMENT_UUID_1 = 'e1f2a3b4-0001-4000-8000-000000000001';
export const SERVICE_ORDER_REF = 'f1a2b3c4-0001-4000-8000-000000000001';

export const makeStockId = (value = STOCK_UUID_1): StockId =>
  StockId.fromString(value);

export const makeStockMovementId = (value = MOVEMENT_UUID_1): StockMovementId =>
  StockMovementId.fromString(value);

export const makeStockRestoreProps = (
  overrides: Partial<StockProps> = {},
): StockProps => ({
  id: makeStockId(),
  itemId: ITEM_UUID_1,
  quantity: 100,
  reserved: 10,
  minimum: 5,
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

export const makeStock = (overrides: Partial<StockProps> = {}): Stock =>
  Stock.restore(makeStockRestoreProps(overrides));

export const makeMovementRestoreProps = (
  overrides: Partial<StockMovementProps> = {},
): StockMovementProps => ({
  id: makeStockMovementId(),
  stockId: STOCK_UUID_1,
  quantity: 10,
  reason: 'PURCHASE',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

export const makeMovement = (
  overrides: Partial<StockMovementProps> = {},
): StockMovement => StockMovement.restore(makeMovementRestoreProps(overrides));
