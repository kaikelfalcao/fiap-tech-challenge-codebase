export class RepairsOnServiceOrder {
  constructor(
    public serviceOrderId: string,
    public repairId: string,
    public costAtTime: number,
    public assignedAt: Date = new Date(),
  ) {}
}
