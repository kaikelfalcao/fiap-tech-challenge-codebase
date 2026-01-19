import { Part } from '@domain/part/part.entity';

export interface PartRepository {
  save(part: Part): Promise<void>;
  findById(id: string): Promise<Part | null>;
  findBySku(sku: string): Promise<Part | null>;
  findAll(options?: { skip?: number; take?: number }): Promise<Part[]>;
  count(): Promise<number>;
  update(part: Part): Promise<void>;
  delete(id: string): Promise<void>;
}
