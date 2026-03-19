import { StockMovementOrmEntity } from '../stock-movement.typeorm.entity';
import { StockOrmEntity } from '../stock.typeorm.entity';

import { StockMovement } from '@/modules/inventory/domain/stock-movement.entity';
import { Stock } from '@/modules/inventory/domain/stock.entity';
import { StockId } from '@/modules/inventory/domain/value-objects/stock-id.vo';
import { StockMovementId } from '@/modules/inventory/domain/value-objects/stock-movement-id.vo';

export class StockMapper {
  static toDomain(orm: StockOrmEntity): Stock {
    return Stock.restore({
      id: StockId.fromString(orm.id),
      itemId: orm.itemId,
      quantity: orm.quantity,
      reserved: orm.reserved,
      minimum: orm.minimum,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(stock: Stock): StockOrmEntity {
    const orm = new StockOrmEntity();
    orm.id = stock.id().value;
    orm.itemId = stock.itemId;
    orm.quantity = stock.quantity;
    orm.reserved = stock.reserved;
    orm.minimum = stock.minimum;
    orm.updatedAt = stock.updatedAt;
    return orm;
  }

  static movementToDomain(orm: StockMovementOrmEntity): StockMovement {
    return StockMovement.restore({
      id: StockMovementId.fromString(orm.id),
      stockId: orm.stockId,
      quantity: orm.quantity,
      reason: orm.reason,
      referenceId: orm.referenceId,
      note: orm.note,
      createdAt: orm.createdAt,
    });
  }

  static movementToOrm(movement: StockMovement): StockMovementOrmEntity {
    const orm = new StockMovementOrmEntity();
    orm.id = movement.id().value;
    orm.stockId = movement.stockId;
    orm.quantity = movement.quantity;
    orm.reason = movement.reason;
    orm.referenceId = movement.referenceId;
    orm.note = movement.note;
    orm.createdAt = movement.createdAt;
    return orm;
  }
}
