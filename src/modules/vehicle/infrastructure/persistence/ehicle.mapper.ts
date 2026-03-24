import { LicensePlate } from '../../domain/value-objects/license-plate.vo';
import { VehicleId } from '../../domain/value-objects/vehicle-id.vo';
import { Vehicle } from '../../domain/vehicle.entity';

import { VehicleOrmEntity } from './vehicle.typeorm.entity';

export class VehicleMapper {
  static toDomain(orm: VehicleOrmEntity): Vehicle {
    return Vehicle.restore({
      id: VehicleId.fromString(orm.id),
      customerId: orm.customerId,
      licensePlate: LicensePlate.restore(orm.licensePlate),
      brand: orm.brand,
      model: orm.model,
      year: orm.year,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(vehicle: Vehicle): VehicleOrmEntity {
    const orm = new VehicleOrmEntity();
    orm.id = vehicle.id().value;
    orm.customerId = vehicle.customerId;
    orm.licensePlate = vehicle.licensePlate.raw;
    orm.brand = vehicle.brand;
    orm.model = vehicle.model;
    orm.year = vehicle.year;
    orm.createdAt = vehicle.createdAt;
    orm.updatedAt = vehicle.updatedAt;
    return orm;
  }
}
