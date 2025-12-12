import { Customer } from '../../../../domain/entities/customer.entity';
import { CustomerTypeOrmEntity } from '../entities/customer.typeorm.entity';
import { UUID } from 'node:crypto';

export class CustomerOrmMapper {
  static toOrm(entity: Customer): CustomerTypeOrmEntity {
    const orm = new CustomerTypeOrmEntity();
    orm.id = entity.id;
    orm.name = entity.name;
    orm.email = entity.email.value;
    orm.document = entity.document.value;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  static toDomain(raw: CustomerTypeOrmEntity): Customer {
    return Customer.create(raw, raw.id as UUID);
  }
}
