import { ServiceOrderStatus } from 'src/domain/enums/service-order-status.enum';

export class UpdateServiceOrderStatusDto {
  serviceOrderId: string;
  newStatus: ServiceOrderStatus;
}
