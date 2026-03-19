import { Item } from '../../domain/item.entity';
import type { CreateItemProps, ItemProps } from '../../domain/item.entity';
import { ItemCode } from '../../domain/value-objects/item-code.vo';
import { ItemId } from '../../domain/value-objects/item-id.vo';
import type { ItemType } from '../../domain/value-objects/item-type.vo';

import { Money } from '@/shared/domain/value-objects/money.vo';

export const ITEM_UUID_1 = 'c1d2e3f4-0001-4000-8000-000000000001';
export const ITEM_UUID_2 = 'c1d2e3f4-0002-4000-8000-000000000002';
export const ITEM_UUID_3 = 'c1d2e3f4-0003-4000-8000-000000000003';

export const makeItemId = (value = ITEM_UUID_1): ItemId =>
  ItemId.fromString(value);

export const makeItemCode = (value = 'PART-001'): ItemCode =>
  ItemCode.create(value);

export const makeMoney = (cents = 5000): Money => Money.fromCents(cents);

export const makeCreateProps = (
  overrides: Partial<CreateItemProps> = {},
): CreateItemProps => ({
  id: makeItemId(),
  code: makeItemCode(),
  name: 'Filtro de óleo',
  type: 'PART' as ItemType,
  unit: 'UN',
  unitPrice: makeMoney(),
  ...overrides,
});

export const makeRestoreProps = (
  overrides: Partial<ItemProps> = {},
): ItemProps => ({
  id: makeItemId(),
  code: makeItemCode(),
  name: 'Filtro de óleo',
  type: 'PART' as ItemType,
  unit: 'UN',
  unitPrice: makeMoney(),
  active: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

export const makeItem = (overrides: Partial<ItemProps> = {}): Item =>
  Item.restore(makeRestoreProps(overrides));
