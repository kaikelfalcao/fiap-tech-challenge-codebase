export class Vehicle {
  constructor(
    public readonly id: string | undefined,
    public brand: string,
    public model: string,
    public year: number,
    public plate: string,
    public customerId: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
