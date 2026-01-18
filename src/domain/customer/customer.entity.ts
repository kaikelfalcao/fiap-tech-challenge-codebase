import { RegistrationNumber } from './registration-number.vo';
import { Email } from './email.vo';
import { Vehicle } from '../entities/vehicle.entity';
import { randomUUID } from 'crypto';

export class Customer {
  private vehicles: Vehicle[] = [];

  protected constructor(
    public id: string,
    public name: string,
    public email: Email,
    public registrationNumber: RegistrationNumber,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  public static create(
    name: string,
    email: string,
    registrationNumber: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    if (name.length < 2) {
      throw new Error('Invalid customer name');
    }

    return new Customer(
      id ?? randomUUID(),
      name,
      Email.create(email),
      RegistrationNumber.create(registrationNumber),
      createdAt,
      updatedAt,
    );
  }

  changeName(name: string) {
    if (name.length < 2) {
      throw new Error('Invalid customer name');
    }
    this.name = name;
  }

  changeEmail(email: string) {
    const emailVO = Email.create(email);
    this.email = emailVO;
  }

  changeRegistrationNumber(number: string) {
    const registrationNumberVO = RegistrationNumber.create(number);
    this.registrationNumber = registrationNumberVO;
  }

  addVehicle(vehicle: Vehicle) {
    if (vehicle.customerId !== this.id) {
      throw new Error('Vehicle does not belong to this customer');
    }
    this.vehicles.push(vehicle);
  }

  removeVehicle(vehicleId: string) {
    this.vehicles = this.vehicles.filter((v) => v.id !== vehicleId);
  }

  getVehicles(): Vehicle[] {
    return this.vehicles;
  }
}
