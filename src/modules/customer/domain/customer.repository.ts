import type { CustomerId } from './customer-id.vo';
import type { Customer } from './customer.entity';
import type { TaxId } from './tax-id.vo';

export interface ListCustomersFilters {
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

export interface ICustomerRepository {
  save(customer: Customer): Promise<void>;
  update(customer: Customer): Promise<void>;
  findById(id: CustomerId): Promise<Customer | null>;
  findByTaxId(taxId: TaxId): Promise<Customer | null>;
  existsByTaxId(taxId: TaxId): Promise<boolean>;
  delete(id: CustomerId): Promise<void>;
  list(filters: ListCustomersFilters): Promise<PaginatedResult<Customer>>;
}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');
