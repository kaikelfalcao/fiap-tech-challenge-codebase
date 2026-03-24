import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type ServiceOrderStatus } from '../../domain/value-objects/service-order-status.vo';

@Entity({ name: 'service_orders' })
export class ServiceOrderOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @Column({
    type: 'enum',
    enum: [
      'RECEIVED',
      'DIAGNOSIS',
      'AWAITING_APPROVAL',
      'IN_EXECUTION',
      'FINALIZED',
      'DELIVERED',
    ],
    default: 'RECEIVED',
  })
  status: ServiceOrderStatus;

  @Column({ name: 'services', type: 'jsonb', default: '[]' })
  services: string;

  @Column({ name: 'items', type: 'jsonb', default: '[]' })
  items: string;

  @Column({ name: 'budget_sent_at', type: 'timestamptz', nullable: true })
  budgetSentAt: Date | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt: Date | null;

  @Column({ name: 'finalized_at', type: 'timestamptz', nullable: true })
  finalizedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
