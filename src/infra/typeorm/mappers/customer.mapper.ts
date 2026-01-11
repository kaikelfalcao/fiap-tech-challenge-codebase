import { Customer } from 'src/domain/entities/customer.entity';
import { CustomerOrm } from '../entities/customer.orm';

export class CustomerMapper {
  public static toDomain(orm: CustomerOrm) {
    return Customer.create(
      orm.name,
      orm.email,
      orm.registrationNumber,
      orm.id,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
