import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { ServiceOrderStatus } from 'src/domain/enums/service-order-status.enum';
import { CustomerOrm } from './customer.orm';
import { VehicleOrm } from './vehicle.orm';
import { PartsOnServiceOrdersOrm } from './parts-on-service-orders.orm';
import { RepairsOnServiceOrdersOrm } from './repairs-on-service-orders.orm';

export const MonetaryTransformer: ValueTransformer = {
  to: (value: number): number => {
    if (value === null || value === undefined) return 0;
    return Math.round(value * 100);
  },

  from: (value: number): number => {
    if (value === null || value === undefined) return 0;
    return value / 100;
  },
};

@Entity('service_orders')
export class ServiceOrderOrm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ServiceOrderStatus,
    default: ServiceOrderStatus.Received,
  })
  status: ServiceOrderStatus;

  @Column({
    type: 'int',
    default: 0,
    transformer: MonetaryTransformer,
  })
  totalCost: number;

  @ManyToOne(() => CustomerOrm)
  @JoinColumn({ name: 'customerId' })
  customer: CustomerOrm;

  @Column()
  customerId: string;

  @ManyToOne(() => VehicleOrm)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: VehicleOrm;

  @Column()
  vehicleId: string;

  @OneToMany(() => PartsOnServiceOrdersOrm, (part) => part.serviceOrder, {
    cascade: true,
  })
  parts: PartsOnServiceOrdersOrm[];

  @OneToMany(() => RepairsOnServiceOrdersOrm, (repair) => repair.serviceOrder, {
    cascade: true,
  })
  repairs: RepairsOnServiceOrdersOrm[];

  @Column({ nullable: true })
  finishedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
