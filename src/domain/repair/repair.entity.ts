export class Repair {
  constructor(
    public id: string,
    public description: string,
    public cost: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  public static create(
    description: string,
    cost: number,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Repair {
    return new Repair(
      id ?? crypto.randomUUID(),
      description,
      cost,
      createdAt,
      updatedAt,
    );
  }

  public changeDescription(newDescription: string): void {
    this.description = newDescription;
  }

  public changeCost(newCost: number): void {
    this.cost = newCost;
  }
}
