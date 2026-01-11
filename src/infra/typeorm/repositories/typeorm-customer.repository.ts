import { CustomerRepository } from 'src/application/ports/customer-repository';
import { Repository } from 'typeorm';
import { CustomerOrm } from '../entities/customer.orm';
import { Customer } from 'src/domain/entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerMapper } from '../mappers/customer.mapper';

export class TypeOrmCustomerRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerOrm)
    private readonly repo: Repository<CustomerOrm>,
  ) {}

  async save(customer: Customer): Promise<void> {
    const orm = this.repo.create({
      id: customer.id,
      name: customer.name,
      email: customer.email.value,
      registrationNumber: customer.registrationNumber.value,
    });

    const saved = await this.repo.save(orm);
    customer.id = saved.id;
    customer.createdAt = orm.createdAt;
    customer.updatedAt = orm.updatedAt;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const found = await this.repo.findOneBy({ email: email });

    if (!found) {
      return null;
    }

    return CustomerMapper.toDomain(found);
  }

  async findByRegistrationNumber(
    registrationNumber: string,
  ): Promise<Customer | null> {
    const found = await this.repo.findOneBy({
      registrationNumber: registrationNumber,
    });

    if (!found) {
      return null;
    }

    return CustomerMapper.toDomain(found);
  }

  async findById(id: string): Promise<Customer | null> {
    const found = await this.repo.findOneBy({
      id: id,
    });

    if (!found) {
      return null;
    }

    return CustomerMapper.toDomain(found);
  }

  async findAll(): Promise<Customer[]> {
    return (await this.repo.find()).map((customer) =>
      CustomerMapper.toDomain(customer),
    );
  }

  async delete(id: string) {
    await this.repo.delete({ id: id });
  }
}
