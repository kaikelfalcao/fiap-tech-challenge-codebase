import { Repair } from '@domain/repair/repair.entity';

export interface RepairRepository {
  save(repair: Repair): Promise<void>;
  update(repair: Repair): Promise<void>;
  findById(id: string): Promise<Repair | null>;
  findAll(options?: { skip?: number; take?: number }): Promise<Repair[]>;
  count(): Promise<number>;
  delete(id: string): Promise<void>;
}
