import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

export class UpdateServiceOrderStatusDto {
  serviceOrderId: string;
  newStatus: ServiceOrderStatus;
}
