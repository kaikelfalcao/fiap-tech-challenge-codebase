export class PartsOnServiceOrder {
  constructor(
    public serviceOrderId: string,
    public partId: string,
    public quantity: number,
    public priceAtTime: number,
    public assignedAt: Date = new Date(),
  ) {}
}
