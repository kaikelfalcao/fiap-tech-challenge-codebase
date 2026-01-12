import { Vehicle } from 'src/domain/entities/vehicle.entity';
import { VehicleOrm } from '../entities/vehicle.orm';
import { CustomerOrm } from '../entities/customer.orm';

export class VehicleMapper {
  public static toDomain(orm: VehicleOrm) {
    return Vehicle.create(
      orm.brand,
      orm.model,
      orm.year,
      orm.plate,
      orm.customer.id,
      orm.id,
      orm.createdAt,
      orm.updatedAt,
    );
  }
  public static toOrm(entity: Vehicle) {
    const orm = new VehicleOrm();
    orm.id = entity.id;
    orm.brand = entity.brand;
    orm.model = entity.model;
    orm.year = entity.year;
    orm.plate = entity.plate.value;

    orm.customer = new CustomerOrm();
    orm.customer.id = entity.customerId;

    return orm;
  }
}
