import { ItemOrmEntity } from '../item.typeorm.entity';

import { Item } from '@/modules/inventory/domain/item.entity';
import { ItemCode } from '@/modules/inventory/domain/value-objects/item-code.vo';
import { ItemId } from '@/modules/inventory/domain/value-objects/item-id.vo';
import { Money } from '@/shared/domain/value-objects/money.vo';

export class ItemMapper {
  static toDomain(orm: ItemOrmEntity): Item {
    return Item.restore({
      id: ItemId.fromString(orm.id),
      code: ItemCode.restore(orm.code),
      name: orm.name,
      type: orm.type,
      unit: orm.unit,
      unitPrice: Money.restore(orm.unitPrice),
      active: orm.active,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(item: Item): ItemOrmEntity {
    const orm = new ItemOrmEntity();
    orm.id = item.id().value;
    orm.code = item.code.value;
    orm.name = item.name;
    orm.type = item.type;
    orm.unit = item.unit;
    orm.unitPrice = item.unitPrice.cents;
    orm.active = item.active;
    orm.createdAt = item.createdAt;
    orm.updatedAt = item.updatedAt;
    return orm;
  }
}
