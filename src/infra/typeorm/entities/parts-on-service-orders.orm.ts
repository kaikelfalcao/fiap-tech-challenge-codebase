import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceOrderOrm } from './service-order.orm';
import { PartOrm } from './part.orm';

@Entity('parts_on_service_orders')
export class PartsOnServiceOrdersOrm {
  @PrimaryColumn()
  serviceOrderId: string;

  @PrimaryColumn()
  partId: string;

  @ManyToOne(() => ServiceOrderOrm, (order) => order.parts)
  @JoinColumn({ name: 'serviceOrderId' })
  serviceOrder: ServiceOrderOrm;

  @ManyToOne(() => PartOrm)
  @JoinColumn({ name: 'partId' })
  part: PartOrm;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'float' })
  priceAtTime: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
