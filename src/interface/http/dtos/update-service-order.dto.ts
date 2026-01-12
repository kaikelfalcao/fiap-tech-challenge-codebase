export class UpdateServiceOrderDto {
  serviceOrderId: string;

  parts?: Array<{
    partId: string;
    quantity: number;
  }>;

  repairs?: Array<{
    repairId: string;
  }>;
}
