import type { Service } from './service.entity';
import type { ServiceCode } from './value-objects/service-code.vo';
import type { ServiceId } from './value-objects/service-id.vo';

export interface ListServicesFilters {
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IServiceRepository {
  save(service: Service): Promise<void>;
  update(service: Service): Promise<void>;
  delete(id: ServiceId): Promise<void>;
  findById(id: ServiceId): Promise<Service | null>;
  findByCode(code: ServiceCode): Promise<Service | null>;
  existsByCode(code: ServiceCode): Promise<boolean>;
  list(filters: ListServicesFilters): Promise<PaginatedResult<Service>>;
}

export const SERVICE_REPOSITORY = Symbol('IServiceRepository');
