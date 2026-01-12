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
import { RepairOrm } from './repair.orm';

@Entity('repairs_on_service_orders')
export class RepairsOnServiceOrdersOrm {
  @PrimaryColumn()
  serviceOrderId: string;

  @PrimaryColumn()
  repairId: string;

  @ManyToOne(() => ServiceOrderOrm, (order) => order.repairs)
  @JoinColumn({ name: 'serviceOrderId' })
  serviceOrder: ServiceOrderOrm;

  @ManyToOne(() => RepairOrm)
  @JoinColumn({ name: 'repairId' })
  repair: RepairOrm;

  @Column({ type: 'float' })
  costAtTime: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
