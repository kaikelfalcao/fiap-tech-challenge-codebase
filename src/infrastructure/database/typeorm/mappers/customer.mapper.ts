import { Customer } from '@domain/customer/customer.entity';
import { CustomerOrm } from '../entities/customer.orm';
import { Vehicle } from '@domain/vehicle/vehicle.entity';
import { VehicleOrm } from '../entities/vehicle.orm';

export class CustomerMapper {
  public static toDomain(orm: CustomerOrm) {
    const customer = Customer.create(
      orm.name,
      orm.email,
      orm.registrationNumber,
      orm.id,
      orm.createdAt,
      orm.updatedAt,
    );

    orm.vehicles?.forEach((vOrm) => {
      const vehicle = Vehicle.create(
        vOrm.brand,
        vOrm.model,
        vOrm.year,
        vOrm.plate,
        orm.id,
        vOrm.id,
        vOrm.createdAt,
        vOrm.updatedAt,
      );
      customer.addVehicle(vehicle);
    });

    return customer;
  }

  static toOrm(customer: Customer): CustomerOrm {
    const customerOrm = new CustomerOrm();
    customerOrm.id = customer.id;
    customerOrm.name = customer.name;
    customerOrm.email = customer.email.value;
    customerOrm.registrationNumber = customer.registrationNumber.value;
    customerOrm.vehicles = customer.getVehicles().map((vehicle) => {
      const vOrm = new VehicleOrm();
      vOrm.id = vehicle.id;
      vOrm.brand = vehicle.brand;
      vOrm.model = vehicle.model;
      vOrm.year = vehicle.year;
      vOrm.plate = vehicle.plate.value;
      vOrm.customer = customerOrm;
      return vOrm;
    });
    return customerOrm;
  }
}
