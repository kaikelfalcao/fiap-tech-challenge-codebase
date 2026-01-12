import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerOrm } from './customer.orm';

@Entity('vehicles')
export class VehicleOrm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ unique: true })
  plate: string;

  @ManyToOne(() => CustomerOrm, (customer) => customer.vehicles)
  customer: CustomerOrm;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
