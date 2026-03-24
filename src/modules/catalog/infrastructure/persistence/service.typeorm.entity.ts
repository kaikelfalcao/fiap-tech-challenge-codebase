import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'catalog_services' })
export class ServiceOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'base_price', type: 'int' })
  basePrice: number; // cents

  @Column({ name: 'estimated_duration', type: 'int' })
  estimatedDuration: number; // minutes

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
