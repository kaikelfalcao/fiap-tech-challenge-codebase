import { FindCustomerUseCase } from '@application/customer';
import type { EmailNotificationService } from '@domain/notification/email-notification.service';
import { ServiceOrderApprovalNotifier } from '@domain/notification/service-order-approval.notifier';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ServiceOrderApprovalEmailNotifier implements ServiceOrderApprovalNotifier {
  constructor(
    @Inject('EmailNotificationService')
    private readonly email: EmailNotificationService,
    private readonly findCustomer: FindCustomerUseCase,
  ) {}

  async notify(order: ServiceOrder): Promise<void> {
    const customer = await this.findCustomer.execute({ id: order.customerId });

    await this.email.send({
      to: customer.email.value,
      subject: 'Aprovação da Ordem de Serviço',
      body: this.buildEmailBody(order),
    });
  }

  private buildEmailBody(order: ServiceOrder): string {
    const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';

    return `
      Sua ordem de serviço foi orçada no valor de ${order.totalCost}.

      Aprovar:
      ${baseUrl}/api/service-orders/${order.id}/approve

      Rejeitar:
      ${baseUrl}/api/service-orders/${order.id}/reject
    `;
  }
}
