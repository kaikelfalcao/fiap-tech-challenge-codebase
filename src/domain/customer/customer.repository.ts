import { Customer } from '@domain/customer/customer.entity';

export interface CustomerRepository {
  save(customer: Customer): Promise<void>;
  findByEmail(email: string): Promise<Customer | null>;
  findByRegistrationNumber(email: string): Promise<Customer | null>;
  findById(id: string): Promise<Customer | null>;
  findAll(options?: { skip?: number; take?: number }): Promise<Customer[]>;
  count(): Promise<number>;
  delete(id: string): Promise<void>;
}
