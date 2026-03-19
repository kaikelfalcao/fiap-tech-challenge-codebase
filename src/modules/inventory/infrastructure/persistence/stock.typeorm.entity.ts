import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ItemOrmEntity } from './item.typeorm.entity';

@Entity({ name: 'inventory_stocks' })
export class StockOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'item_id', type: 'uuid', unique: true })
  itemId: string;

  @OneToOne(() => ItemOrmEntity)
  @JoinColumn({ name: 'item_id' })
  item: ItemOrmEntity;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reserved: number;

  @Column({ type: 'int', default: 0 })
  minimum: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
