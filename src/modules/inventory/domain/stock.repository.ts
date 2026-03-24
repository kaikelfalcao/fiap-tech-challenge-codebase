import type { StockMovement } from './stock-movement.entity';
import type { Stock } from './stock.entity';
import type { StockId } from './value-objects/stock-id.vo';

export interface IStockRepository {
  save(stock: Stock): Promise<void>;
  update(stock: Stock): Promise<void>;
  findById(id: StockId): Promise<Stock | null>;
  findByItemId(itemId: string): Promise<Stock | null>;
  deleteByItemId(itemId: string): Promise<void>;
  saveMovement(movement: StockMovement): Promise<void>;
  listMovements(stockId: string): Promise<StockMovement[]>;
}

export const STOCK_REPOSITORY = Symbol('IStockRepository');
