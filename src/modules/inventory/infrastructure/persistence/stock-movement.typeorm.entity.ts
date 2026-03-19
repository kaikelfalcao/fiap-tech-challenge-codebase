import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

import { type MovementReason } from '../../domain/stock-movement.entity';

@Entity({ name: 'inventory_stock_movements' })
export class StockMovementOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'stock_id', type: 'uuid' })
  stockId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'enum',
    enum: ['PURCHASE', 'ADJUSTMENT', 'RESERVATION', 'RELEASE', 'CONSUMPTION'],
  })
  reason: MovementReason;

  @Column({ name: 'reference_id', nullable: true })
  referenceId?: string;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
