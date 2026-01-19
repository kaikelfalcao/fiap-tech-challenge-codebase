import { Customer } from '@domain/customer/customer.entity';
import { CustomerOrm } from '../entities/customer.orm';
import { CustomerMapper } from '../mappers/customer.mapper';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository } from '@domain/customer/customer.repository';

export class TypeOrmCustomerRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerOrm)
    private readonly repo: Repository<CustomerOrm>,
  ) {}

  async save(customer: Customer): Promise<void> {
    await this.repo.save(
      this.repo.create({
        id: customer.id,
        name: customer.name,
        email: customer.email.value,
        registrationNumber: customer.registrationNumber.value,
      }),
    );
  }

  async findById(id: string): Promise<Customer | null> {
    return this.findOne({ id });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.findOne({ email });
  }

  async findByRegistrationNumber(
    registrationNumber: string,
  ): Promise<Customer | null> {
    return this.findOne({ registrationNumber });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
  }): Promise<Customer[]> {
    const customers = await this.repo.find({
      skip: options?.skip,
      take: options?.take,
      order: { createdAt: 'DESC' },
    });

    return customers.map((customer) => CustomerMapper.toDomain(customer));
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private async findOne(where: Partial<CustomerOrm>): Promise<Customer | null> {
    const found = await this.repo.findOneBy(where);
    return found ? CustomerMapper.toDomain(found) : null;
  }
}
