import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type ItemType } from '../../domain/value-objects/item-type.vo';

@Entity({ name: 'inventory_items' })
export class ItemOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ['PART', 'SUPPLY'] })
  type: ItemType;

  @Column({ length: 20 })
  unit: string;

  @Column({ name: 'unit_price', type: 'int' })
  unitPrice: number; // cents

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
