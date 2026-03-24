import { Service } from '../../domain/service.entity';
import { Duration } from '../../domain/value-objects/duration.vo';
import { ServiceCode } from '../../domain/value-objects/service-code.vo';
import { ServiceId } from '../../domain/value-objects/service-id.vo';

import { ServiceOrmEntity } from './service.typeorm.entity';

import { Money } from '@/shared/domain/value-objects/money.vo';

export class ServiceMapper {
  static toDomain(orm: ServiceOrmEntity): Service {
    return Service.restore({
      id: ServiceId.fromString(orm.id),
      code: ServiceCode.restore(orm.code),
      name: orm.name,
      description: orm.description,
      basePrice: Money.restore(orm.basePrice),
      estimatedDuration: Duration.restore(orm.estimatedDuration),
      active: orm.active,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(service: Service): ServiceOrmEntity {
    const orm = new ServiceOrmEntity();
    orm.id = service.id().value;
    orm.code = service.code.value;
    orm.name = service.name;
    orm.description = service.description;
    orm.basePrice = service.basePrice.cents;
    orm.estimatedDuration = service.estimatedDuration.minutes;
    orm.active = service.active;
    orm.createdAt = service.createdAt;
    orm.updatedAt = service.updatedAt;
    return orm;
  }
}
