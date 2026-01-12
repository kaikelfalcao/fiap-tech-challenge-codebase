import { randomUUID } from 'crypto';
import { Plate } from '../value-objects/plate.vo';

export class Vehicle {
  constructor(
    public id: string,
    public brand: string,
    public model: string,
    public year: number,
    public plate: Plate,
    public customerId: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  public static create(
    brand: string,
    model: string,
    year: number,
    plate: string,
    customerId: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Vehicle {
    const plateVO = Plate.create(plate);

    return new Vehicle(
      id ?? randomUUID(),
      brand,
      model,
      year,
      plateVO,
      customerId,
      createdAt,
      updatedAt,
    );
  }

  public changeBrand(newBrand: string): void {
    this.brand = newBrand;
  }

  public changeModel(newModel: string): void {
    this.model = newModel;
  }

  public changeYear(newYear: number): void {
    this.year = newYear;
  }

  public changePlate(newPlate: string): void {
    this.plate = Plate.create(newPlate);
  }

  public changeCustomerId(newCustomerId: string): void {
    this.customerId = newCustomerId;
  }
}
