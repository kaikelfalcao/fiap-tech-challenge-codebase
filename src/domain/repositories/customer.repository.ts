import { Customer } from 'src/domain/entities/customer.entity';

export interface CustomerRepository {
  save(customer: Customer): Promise<void>;
  findByEmail(email: string): Promise<Customer | null>;
  findByRegistrationNumber(email: string): Promise<Customer | null>;
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  delete(id: string): Promise<void>;
}
