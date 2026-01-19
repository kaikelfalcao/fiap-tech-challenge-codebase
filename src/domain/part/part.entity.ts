export class Part {
  constructor(
    public id: string,
    public name: string,
    public sku: string,
    public price: number,
    public quantity: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  public static create(
    name: string,
    sku: string,
    price: number,
    quantity?: number,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Part {
    return new Part(
      id ?? crypto.randomUUID(),
      name,
      sku,
      price,
      quantity ?? 0,
      createdAt,
      updatedAt,
    );
  }

  public changeName(name: string) {
    this.name = name;
  }

  public changePrice(price: number) {
    this.price = price;
  }

  public changeQuantity(quantity: number) {
    this.quantity = quantity;
  }

  public changeSku(sku: string) {
    this.sku = sku;
  }
}
