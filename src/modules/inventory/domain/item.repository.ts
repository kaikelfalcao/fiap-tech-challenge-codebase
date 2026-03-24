import type { Item } from './item.entity';
import type { ItemCode } from './value-objects/item-code.vo';
import type { ItemId } from './value-objects/item-id.vo';
import type { ItemType } from './value-objects/item-type.vo';

export interface ListItemsFilters {
  type?: ItemType;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IItemRepository {
  save(item: Item): Promise<void>;
  update(item: Item): Promise<void>;
  delete(id: ItemId): Promise<void>;
  findById(id: ItemId): Promise<Item | null>;
  findByCode(code: ItemCode): Promise<Item | null>;
  existsByCode(code: ItemCode): Promise<boolean>;
  list(filters: ListItemsFilters): Promise<PaginatedResult<Item>>;
}

export const ITEM_REPOSITORY = Symbol('IItemRepository');
