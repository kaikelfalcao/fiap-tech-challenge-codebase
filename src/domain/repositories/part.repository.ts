import { Part } from 'src/domain/entities/part.entity';

export interface PartRepository {
  save(part: Part): Promise<void>;
  findById(id: string): Promise<Part | null>;
  findBySku(sku: string): Promise<Part | null>;
  findAll(): Promise<Part[]>;
  update(part: Part): Promise<void>;
  delete(id: string): Promise<void>;
}
