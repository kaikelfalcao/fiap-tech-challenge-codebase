import { ServiceOrder } from '@domain/service-order/service-order.entity';

export interface ServiceOrderApprovalNotifier {
  notify(order: ServiceOrder): Promise<void>;
}
