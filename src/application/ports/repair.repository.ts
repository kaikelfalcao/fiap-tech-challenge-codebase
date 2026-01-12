import { Repair } from 'src/domain/entities/repair.entity';

export interface RepairRepository {
  save(repair: Repair): Promise<void>;
  update(repair: Repair): Promise<void>;
  findById(id: string): Promise<Repair | null>;
  findAll(): Promise<Repair[]>;
  delete(id: string): Promise<void>;
}
