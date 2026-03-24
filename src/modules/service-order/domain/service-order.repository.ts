import type { ServiceOrder } from './service-order.entity';
import type { ServiceOrderId } from './value-objects/service-order-id.vo';
import type { ServiceOrderStatus } from './value-objects/service-order-status.vo';

export interface ListServiceOrdersFilters {
  customerId?: string;
  vehicleId?: string;
  statuses?: ServiceOrderStatus[];
  excludeStatuses?: ServiceOrderStatus[];
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IServiceOrderRepository {
  save(order: ServiceOrder): Promise<void>;
  update(order: ServiceOrder): Promise<void>;
  findById(id: ServiceOrderId): Promise<ServiceOrder | null>;
  list(
    filters: ListServiceOrdersFilters,
  ): Promise<PaginatedResult<ServiceOrder>>;
}

export const SERVICE_ORDER_REPOSITORY = Symbol('IServiceOrderRepository');
