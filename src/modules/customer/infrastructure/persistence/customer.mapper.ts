import { CustomerId } from '../../domain/customer-id.vo';
import { Customer } from '../../domain/customer.entity';
import { TaxId } from '../../domain/tax-id.vo';

import { CustomerOrmEntity } from './customer.typeorm.entity';

import { Email } from '@/shared/domain/value-objects/email.vo';

export class CustomerMapper {
  static toDomain(orm: CustomerOrmEntity): Customer {
    return Customer.restore({
      id: CustomerId.fromString(orm.id),
      taxId: TaxId.create(orm.taxId),
      fullName: orm.fullName,
      phone: orm.phone,
      email: new Email(orm.email),
      active: orm.active,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(customer: Customer): CustomerOrmEntity {
    const orm = new CustomerOrmEntity();
    orm.id = customer.id().value;
    orm.taxId = customer.taxId.raw;
    orm.fullName = customer.fullName;
    orm.phone = customer.phone;
    orm.email = customer.email.getValue();
    orm.active = customer.active;
    orm.createdAt = customer.createdAt;
    orm.updatedAt = customer.updatedAt;
    return orm;
  }
}
