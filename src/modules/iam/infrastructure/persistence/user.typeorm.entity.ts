import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Role } from '../../domain/value-objects/role.vo';

@Entity({ name: 'iam_users' })
export class UserOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tax_id', unique: true, length: 14 })
  taxId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: ['ADMIN', 'CUSTOMER'] })
  role: Role;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
