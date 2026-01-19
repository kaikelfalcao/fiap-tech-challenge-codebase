export class UpdateServiceOrderDto {
  parts?: Array<{
    partId: string;
    quantity: number;
  }>;

  repairs?: Array<{
    repairId: string;
  }>;
}
